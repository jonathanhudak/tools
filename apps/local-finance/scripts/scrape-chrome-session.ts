// Scrape Amazon orders from an existing Chrome session
// Run with: npx tsx scripts/scrape-chrome-session.ts

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.amazon.com/your-orders/orders?timeFilter=year-2025';
const ALLOWED_RECIPIENTS = ['Jonathan', 'Euguenia'];
const TOTAL_PAGES = 38;

interface Order {
  orderId: string;
  orderDate: string;
  total: number;
  recipient: string;
}

// This script expects you to:
// 1. Have Chrome DevTools MCP running and connected to a logged-in Amazon session
// 2. Navigate to the orders page manually

const SCRAPE_SCRIPT = `
const ALLOWED_RECIPIENTS = ['Jonathan', 'Euguenia'];
const orders = [];
const orderIdElements = [];
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_TEXT,
  { acceptNode: function(node) {
      if (node.textContent.trim().match(/^\\d{3}-\\d{7}-\\d{7}$/)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  }
);

let node;
while (node = walker.nextNode()) {
  orderIdElements.push(node.parentElement);
}

for (const orderIdEl of orderIdElements) {
  const orderId = orderIdEl.textContent.trim();
  let container = orderIdEl;

  for (let i = 0; i < 10; i++) {
    container = container.parentElement;
    if (!container) break;

    const text = container.innerText || '';
    if (text.includes('ORDER PLACED') && text.includes('TOTAL') &&
        (text.includes('SHIP TO') || text.includes('PICKUP AT')) && text.includes(orderId)) {
      const orderIdMatches = text.match(/\\d{3}-\\d{7}-\\d{7}/g);
      if (orderIdMatches && orderIdMatches.length === 1) break;
    }
  }

  if (!container) continue;
  const text = container.innerText;

  const dateMatch = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2},\\s+\\d{4}/);
  const orderDate = dateMatch ? dateMatch[0] : '';

  const totalMatch = text.match(/TOTAL\\s+\\$?([\\d,]+\\.\\d{2})/);
  const total = totalMatch ? totalMatch[1] : '0.00';

  let recipient = '';
  const shipToMatch = text.match(/SHIP TO\\s+([^\\n]+?)(?:\\s+ORDER(?:ED BY)?|\\s+ORDER #)/);
  const pickupAtMatch = text.match(/PICKUP AT\\s+([^\\n]+?)(?:\\s+ORDER #)/);

  if (shipToMatch) recipient = shipToMatch[1].trim();
  else if (pickupAtMatch) recipient = 'Pickup: ' + pickupAtMatch[1].trim();

  const matchesFilter = !recipient || ALLOWED_RECIPIENTS.some(name =>
    recipient.toLowerCase().includes(name.toLowerCase())
  );

  if (matchesFilter) {
    orders.push({
      orderId,
      orderDate,
      total: parseFloat(total.replace(/,/g, '')),
      recipient
    });
  }
}

({ orders: orders })
`;

console.log('Amazon Order Scraper (Chrome Session)\\n');
console.log('This script is designed to be run manually page-by-page.');
console.log('Paste the SCRAPE_SCRIPT into your browser console on each orders page.\\n');
console.log('Copy this script into your browser console:\\n');
console.log('```javascript');
console.log(SCRAPE_SCRIPT);
console.log('```\\n');
console.log('Instructions:');
console.log('1. Open https://www.amazon.com/your-orders/orders?timeFilter=year-2025');
console.log('2. Paste the above script into the browser console');
console.log('3. Copy the results');
console.log('4. Click "Next" to go to the next page');
console.log('5. Repeat for all 38 pages');
console.log('6. Combine all results into a single JSON array');
