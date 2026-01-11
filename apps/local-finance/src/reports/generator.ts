// HTML Report Generator

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import type { YearReport, RecurringPaymentSummary } from '../core/types.js';
import { getReportsDir } from '../core/config.js';

// Register Handlebars helpers
Handlebars.registerHelper('formatMoney', (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
});

Handlebars.registerHelper('formatPercent', (value: number) => {
  // Convert 0-1 range to 0-100%
  const percentage = value <= 1 ? value * 100 : value;
  return percentage.toFixed(0) + '%';
});

Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

Handlebars.registerHelper('json', (context: unknown) => {
  return JSON.stringify(context);
});

Handlebars.registerHelper('barWidth', (value: number, max: number) => {
  return Math.min((value / max) * 100, 100).toFixed(1) + '%';
});

const BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #1a1a2e;
      --text-secondary: #6c757d;
      --border-color: #dee2e6;
      --accent-color: #4361ee;
      --success-color: #10b981;
      --danger-color: #ef4444;
      --warning-color: #f59e0b;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1a1a2e;
        --bg-secondary: #16213e;
        --text-primary: #e4e4e7;
        --text-secondary: #a1a1aa;
        --border-color: #374151;
        --accent-color: #6366f1;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    h2 {
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      color: var(--text-primary);
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    h3 {
      font-size: 1.25rem;
      margin: 1.5rem 0 0.75rem;
      color: var(--text-primary);
    }

    .subtitle {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid var(--border-color);
    }

    .summary-card .label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .summary-card .value {
      font-size: 1.75rem;
      font-weight: 600;
    }

    .summary-card .value.positive { color: var(--success-color); }
    .summary-card .value.negative { color: var(--danger-color); }

    .chart-container {
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-color);
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
      background: var(--bg-secondary);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      background: var(--bg-primary);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover {
      background: var(--bg-primary);
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .bar-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .bar {
      height: 8px;
      background: var(--accent-color);
      border-radius: 4px;
      min-width: 4px;
    }

    .insights-list {
      list-style: none;
      padding: 0;
    }

    .insights-list li {
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 8px;
      margin-bottom: 0.75rem;
      border: 1px solid var(--border-color);
      position: relative;
      padding-left: 2.5rem;
    }

    .insights-list li::before {
      content: "💡";
      position: absolute;
      left: 1rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active { background: #dcfce7; color: #166534; }
    .status-inactive { background: #fef3c7; color: #92400e; }

    /* Sortable table headers */
    th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-right: 1.5rem;
    }

    th.sortable:hover {
      background: var(--bg-secondary);
    }

    th.sortable::after {
      content: "⇅";
      position: absolute;
      right: 0.5rem;
      opacity: 0.3;
      font-size: 0.875rem;
    }

    th.sortable.asc::after {
      content: "↑";
      opacity: 1;
    }

    th.sortable.desc::after {
      content: "↓";
      opacity: 1;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      h2 {
        font-size: 1.25rem;
      }

      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }

      .summary-card {
        padding: 1rem;
      }

      .summary-card .value {
        font-size: 1.5rem;
      }

      /* Responsive table - horizontal scroll */
      .table-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-bottom: 2rem;
      }

      table {
        margin-bottom: 0;
        min-width: 600px;
      }

      th, td {
        padding: 0.5rem;
        font-size: 0.875rem;
      }

      .chart-wrapper {
        height: 250px;
      }
    }

    @media (max-width: 480px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }

      .summary-card .value {
        font-size: 1.25rem;
      }

      th, td {
        padding: 0.375rem 0.5rem;
        font-size: 0.8125rem;
      }
    }
    .status-cancel { background: #fee2e2; color: #991b1b; }

    @media print {
      body { padding: 0; }
      .chart-container { break-inside: avoid; }
    }

    @media (max-width: 768px) {
      body { padding: 1rem; }
      .summary-grid { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  {{{content}}}

  <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.875rem;">
    Generated by Local Finance Analyzer on {{generatedAt}}
  </footer>

  <script>
    // Table sorting functionality
    document.addEventListener('DOMContentLoaded', function() {
      const tables = document.querySelectorAll('table');

      tables.forEach(table => {
        const headers = table.querySelectorAll('th.sortable');

        headers.forEach((header, columnIndex) => {
          header.addEventListener('click', () => {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Determine sort direction
            const isAscending = header.classList.contains('asc');

            // Remove sort classes from all headers
            headers.forEach(h => h.classList.remove('asc', 'desc'));

            // Add appropriate class to clicked header
            header.classList.add(isAscending ? 'desc' : 'asc');

            // Get the actual column index (accounting for colspan)
            const allHeaders = Array.from(table.querySelectorAll('th'));
            const actualColumnIndex = allHeaders.indexOf(header);

            // Sort rows
            rows.sort((a, b) => {
              const aCell = a.cells[actualColumnIndex];
              const bCell = b.cells[actualColumnIndex];

              if (!aCell || !bCell) return 0;

              const aText = aCell.textContent.trim();
              const bText = bCell.textContent.trim();

              // Try to parse as number (handle currency and percentages)
              const aNum = parseFloat(aText.replace(/[$,%x]/g, ''));
              const bNum = parseFloat(bText.replace(/[$,%x]/g, ''));

              let comparison = 0;
              if (!isNaN(aNum) && !isNaN(bNum)) {
                comparison = aNum - bNum;
              } else {
                comparison = aText.localeCompare(bText);
              }

              return isAscending ? -comparison : comparison;
            });

            // Reorder rows in DOM
            rows.forEach(row => tbody.appendChild(row));
          });
        });
      });
    });
  </script>
</body>
</html>
`;

const YEAR_SUMMARY_TEMPLATE = `
<h1>{{year}} Financial Summary</h1>
<p class="subtitle">Complete year-end financial report</p>

<div class="summary-grid">
  <div class="summary-card">
    <div class="label">Total Income</div>
    <div class="value positive">{{formatMoney totalIncome}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Total Expenses</div>
    <div class="value negative">{{formatMoney totalExpenses}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Net Savings</div>
    <div class="value {{#if (gt net 0)}}positive{{else}}negative{{/if}}">{{formatMoney net}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Savings Rate</div>
    <div class="value {{#if (gt savingsRate 0)}}positive{{else}}negative{{/if}}">{{formatPercent savingsRate}}</div>
  </div>
</div>

<h2>Monthly Trends</h2>
<div class="chart-container">
  <div class="chart-wrapper">
    <canvas id="monthlyChart"></canvas>
  </div>
</div>

<h2>Spending by Category</h2>
<div class="chart-container">
  <div class="chart-wrapper">
    <canvas id="categoryChart"></canvas>
  </div>
</div>

<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th class="sortable">Category</th>
        <th class="sortable text-right">Amount</th>
        <th class="sortable text-right">%</th>
        <th style="width: 30%"></th>
      </tr>
    </thead>
    <tbody>
      {{#each byCategory}}
      <tr>
        <td>{{categoryName}}{{#if parentName}} <small style="color: var(--text-secondary);">({{parentName}})</small>{{/if}}</td>
        <td class="text-right">{{formatMoney amount}}</td>
        <td class="text-right">{{formatPercent percentage}}</td>
        <td>
          <div class="bar-container">
            <div class="bar" style="width: {{barWidth percentage 100}}"></div>
          </div>
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>

<h2>Top Merchants</h2>
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th class="sortable">Merchant</th>
        <th class="sortable text-right">Amount</th>
        <th class="sortable text-right">Transactions</th>
      </tr>
    </thead>
    <tbody>
      {{#each topMerchants}}
      <tr>
        <td>{{merchant}}</td>
        <td class="text-right">{{formatMoney amount}}</td>
        <td class="text-right">{{count}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>

{{#if recurringPayments.length}}
<h2>Recurring Payments</h2>
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th class="sortable">Service</th>
        <th class="sortable">Frequency</th>
        <th class="sortable text-right">Amount</th>
        <th class="sortable text-right">Yearly Total</th>
        <th class="sortable text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      {{#each recurringPayments}}
      <tr>
        <td>{{merchant}}</td>
        <td>{{frequency}}</td>
        <td class="text-right">{{formatMoney amount}}</td>
        <td class="text-right">{{formatMoney yearlyTotal}}</td>
        <td class="text-center">
          <span class="status-badge status-{{#if isActive}}active{{else}}inactive{{/if}}">
            {{#if isActive}}Active{{else}}Inactive{{/if}}
          </span>
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>
{{/if}}

{{#if insights.length}}
<h2>Insights</h2>
<ul class="insights-list">
  {{#each insights}}
  <li>{{this}}</li>
  {{/each}}
</ul>
{{/if}}

<script>
  // Monthly Chart
  const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(monthlyCtx, {
    type: 'bar',
    data: {
      labels: {{{json monthLabels}}},
      datasets: [
        {
          label: 'Income',
          data: {{{json monthlyIncome}}},
          backgroundColor: '#10b981',
        },
        {
          label: 'Expenses',
          data: {{{json monthlyExpenses}}},
          backgroundColor: '#ef4444',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });

  // Category Chart
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: {{{json categoryLabels}}},
      datasets: [{
        data: {{{json categoryAmounts}}},
        backgroundColor: [
          '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
          '#4895ef', '#560bad', '#480ca8', '#b5179e', '#f15bb5'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
</script>
`;

const RECURRING_TEMPLATE = `
<h1>Recurring Payments</h1>
<p class="subtitle">Detected recurring patterns from actual transactions</p>

<div class="summary-grid">
  <div class="summary-card">
    <div class="label">Total Patterns</div>
    <div class="value">{{totalCount}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Active Subscriptions</div>
    <div class="value">{{activeCount}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Total Transactions</div>
    <div class="value">{{totalTransactions}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Total Spent (Active)</div>
    <div class="value negative">{{formatMoney totalSpentActive}}</div>
  </div>
  <div class="summary-card">
    <div class="label">Total Spent (All)</div>
    <div class="value negative">{{formatMoney totalSpentAll}}</div>
  </div>
</div>

<h2>Active Recurring Payments</h2>
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th class="sortable">Service</th>
        <th class="sortable">Frequency</th>
        <th class="sortable text-right">Avg Amount</th>
        <th class="sortable text-center">Count</th>
        <th class="sortable text-right">Total Spent</th>
        <th class="sortable text-center">Confidence</th>
      </tr>
    </thead>
    <tbody>
      {{#each payments}}
      <tr>
        <td>{{merchant}}</td>
        <td>{{frequency}}</td>
        <td class="text-right">{{formatMoney amount}}</td>
        <td class="text-center">{{occurrences}}x</td>
        <td class="text-right"><strong>{{formatMoney totalSpent}}</strong></td>
        <td class="text-center">{{formatPercent confidence}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>

{{#if inactivePayments.length}}
<h2>Inactive / Cancelled</h2>
<p style="color: var(--text-secondary); margin-bottom: 1rem;">
  These subscriptions haven't charged recently - they may be cancelled or paused.
</p>
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th class="sortable">Service</th>
        <th class="sortable">Last Amount</th>
        <th class="sortable">Last Seen</th>
      </tr>
    </thead>
    <tbody>
      {{#each inactivePayments}}
      <tr>
        <td>{{merchant}}</td>
        <td>{{formatMoney amount}}</td>
        <td>{{lastSeen}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>
{{/if}}
`;

export function generateYearSummaryHTML(report: YearReport): string {
  const savingsRate = report.totalIncome > 0 ? (report.net / report.totalIncome) * 100 : 0;

  const data = {
    ...report,
    savingsRate,
    monthLabels: report.byMonth.map(m => m.monthName.slice(0, 3)),
    monthlyIncome: report.byMonth.map(m => m.income),
    monthlyExpenses: report.byMonth.map(m => Math.abs(m.expenses)),
    categoryLabels: report.byCategory.slice(0, 10).map(c => c.categoryName),
    categoryAmounts: report.byCategory.slice(0, 10).map(c => c.amount),
  };

  const contentTemplate = Handlebars.compile(YEAR_SUMMARY_TEMPLATE);
  const content = contentTemplate(data);

  const baseTemplate = Handlebars.compile(BASE_TEMPLATE);
  return baseTemplate({
    title: `${report.year} Financial Summary`,
    content,
    generatedAt: new Date().toLocaleDateString(),
  });
}

export function generateRecurringHTML(payments: RecurringPaymentSummary[]): string {
  const activePayments = payments.filter(p => p.isActive);
  const inactivePayments = payments.filter(p => !p.isActive);

  const totalSpentActive = activePayments.reduce((sum, p) => sum + p.totalSpent, 0);
  const totalSpentAll = payments.reduce((sum, p) => sum + p.totalSpent, 0);
  const totalTransactions = payments.reduce((sum, p) => sum + p.occurrences, 0);

  const data = {
    payments: activePayments,
    inactivePayments,
    activeCount: activePayments.length,
    totalCount: payments.length,
    totalSpentActive,
    totalSpentAll,
    totalTransactions,
  };

  const contentTemplate = Handlebars.compile(RECURRING_TEMPLATE);
  const content = contentTemplate(data);

  const baseTemplate = Handlebars.compile(BASE_TEMPLATE);
  return baseTemplate({
    title: 'Recurring Payments',
    content,
    generatedAt: new Date().toLocaleDateString(),
  });
}

export function saveReport(filename: string, html: string): string {
  const reportsDir = getReportsDir();
  const filePath = path.join(reportsDir, filename);
  fs.writeFileSync(filePath, html);
  return filePath;
}
