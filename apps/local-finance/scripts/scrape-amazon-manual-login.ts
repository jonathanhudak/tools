// Amazon Order Scraper - Manual Login Version
// Run with: npx tsx scripts/scrape-amazon-manual-login.ts

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface AmazonOrder {
  orderId: string;
  orderDate: Date;
  total: number;
  items: AmazonItem[];
  recipient?: string;
}

interface AmazonItem {
  title: string;
  price: number | null;
  quantity: number;
}

const AMAZON_ORDERS_URL = 'https://www.amazon.com/your-orders/orders';
const ALLOWED_RECIPIENTS = ['Jonathan', 'Euguenia'];

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function scrapeAmazonOrders(year: number = 2025): Promise<AmazonOrder[]> {
  console.log('\n🛒 Amazon Order Scraper (Manual Login)\n');
  console.log('Filtering for recipients: Jonathan, Euguenia\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    userDataDir: './chrome-session', // Persist session
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const ordersUrl = `${AMAZON_ORDERS_URL}?timeFilter=year-${year}&startIndex=0`;
  console.log(`Opening: ${ordersUrl}\n`);
  await page.goto(ordersUrl, { waitUntil: 'networkidle2' });

  console.log('📋 Please log into Amazon and navigate to your 2025 orders page.');
  console.log('   The browser window should now be open.\n');

  await prompt('Press ENTER when you are logged in and on the orders page...');

  console.log('\n🔍 Starting to scrape orders...\n');

  const allOrders: AmazonOrder[] = [];
  let pageNum = 1;
  let hasNextPage = true;

  while (hasNextPage && pageNum <= 38) {
    console.log(`📄 Scraping page ${pageNum}/38...`);

    await new Promise(r => setTimeout(r, 2000));

    // Scrape orders directly from the list page
    const pageOrders = await page.evaluate(({recipients}) => {
      const orders: Array<{
        orderId: string;
        orderDate: string;
        total: string;
        recipient: string;
      }> = [];

      // Find all order ID elements
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      const orderIdElements: HTMLElement[] = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent && node.textContent.trim().match(/^\d{3}-\d{7}-\d{7}$/)) {
          orderIdElements.push(node.parentElement as HTMLElement);
        }
      }

      for (const orderIdEl of orderIdElements) {
        const orderId = orderIdEl.textContent?.trim() || '';
        let container: HTMLElement | null = orderIdEl;

        // Find container with all order info
        for (let i = 0; i < 10; i++) {
          container = container?.parentElement as HTMLElement;
          if (!container) break;

          const text = container.innerText || '';
          if (text.includes('ORDER PLACED') && text.includes('TOTAL') &&
              (text.includes('SHIP TO') || text.includes('PICKUP AT')) && text.includes(orderId)) {
            const orderIdMatches = text.match(/\d{3}-\d{7}-\d{7}/g);
            if (orderIdMatches && orderIdMatches.length === 1) break;
          }
        }

        if (!container) continue;
        const text = container.innerText;

        // Extract data
        const dateMatch = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/);
        const orderDate = dateMatch ? dateMatch[0] : '';

        const totalMatch = text.match(/TOTAL\s+\$?([\d,]+\.\d{2})/);
        const total = totalMatch ? totalMatch[1] : '0.00';

        let recipient = '';
        const shipToMatch = text.match(/SHIP TO\s+([^\n]+?)(?:\s+ORDER(?:ED BY)?|\s+ORDER #)/);
        const pickupAtMatch = text.match(/PICKUP AT\s+([^\n]+?)(?:\s+ORDER #)/);

        if (shipToMatch) recipient = shipToMatch[1].trim();
        else if (pickupAtMatch) recipient = 'Pickup: ' + pickupAtMatch[1].trim();

        // Filter
        const matchesFilter = !recipient || recipients.some((name: string) =>
          recipient.toLowerCase().includes(name.toLowerCase())
        );

        if (matchesFilter) {
          orders.push({ orderId, orderDate, total, recipient });
        }
      }

      return orders;
    }, { recipients: ALLOWED_RECIPIENTS });

    console.log(`   Found ${pageOrders.length} matching orders on this page`);

    // Add to all orders
    for (const order of pageOrders) {
      allOrders.push({
        orderId: order.orderId,
        orderDate: parseAmazonDate(order.orderDate),
        total: parsePrice(order.total),
        recipient: order.recipient || 'Unknown',
        items: [], // Not extracting items from list view
      });
      console.log(`   ✓ ${order.orderId} - ${order.recipient} - $${order.total}`);
    }

    console.log(`   Total so far: ${allOrders.length} orders\n`);

    // Navigate to next page
    if (pageNum < 38) {
      const nextUrl = `${AMAZON_ORDERS_URL}?timeFilter=year-${year}&startIndex=${pageNum * 10}`;
      await page.goto(nextUrl, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 2000));
      pageNum++;
    } else {
      hasNextPage = false;
    }
  }

  await browser.close();

  console.log(`\n✅ Scraped ${allOrders.length} orders total\n`);

  return allOrders;
}

function parseAmazonDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
}

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

async function main() {
  const year = parseInt(process.argv[2] || '2025', 10);
  const outputFile = process.argv[3] || `amazon-orders-${year}-filtered.json`;

  console.log(`Scraping Amazon orders for ${year}...\n`);

  const orders = await scrapeAmazonOrders(year);

  if (orders.length === 0) {
    console.log('No matching orders found.');
    return;
  }

  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(orders, null, 2));

  console.log(`📁 Saved ${orders.length} orders to: ${outputPath}`);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  console.log(`\n📊 Summary:`);
  console.log(`   Total orders: ${orders.length}`);
  console.log(`   Total spent: $${totalSpent.toFixed(2)}\n`);

  const byRecipient: Record<string, number> = {};
  orders.forEach(o => {
    const name = o.recipient || 'Unknown';
    byRecipient[name] = (byRecipient[name] || 0) + o.total;
  });

  console.log('   By recipient:');
  Object.entries(byRecipient).forEach(([name, total]) => {
    console.log(`     ${name}: $${total.toFixed(2)}`);
  });
}

main().catch(console.error);
