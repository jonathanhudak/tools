// Amazon Order Scraper
// Run with: npx tsx scripts/scrape-amazon-orders.ts

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface AmazonOrder {
  orderId: string;
  orderDate: Date;
  total: number;
  items: AmazonItem[];
  buyer?: string;
}

interface AmazonItem {
  title: string;
  price: number | null;
  quantity: number;
  seller?: string;
}

const AMAZON_ORDERS_URL = 'https://www.amazon.com/your-orders/orders';

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
  console.log('\n🛒 Amazon Order Scraper\n');
  console.log('This script will:');
  console.log('1. Open a browser window');
  console.log('2. Wait for you to log into Amazon');
  console.log('3. Scrape your order history\n');

  // Launch browser in non-headless mode so user can log in
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Navigate to orders page
  const ordersUrl = `${AMAZON_ORDERS_URL}?timeFilter=year-${year}`;
  console.log(`Opening: ${ordersUrl}\n`);
  await page.goto(ordersUrl, { waitUntil: 'networkidle2' });

  // Wait for user to log in
  console.log('📋 Please log into your Amazon account in the browser window.');
  console.log('   Navigate to your orders page if not redirected automatically.\n');

  await prompt('Press ENTER when you are on your orders page and ready to scrape...');

  // Verify we're on the orders page
  const currentUrl = page.url();
  if (!currentUrl.includes('your-orders')) {
    console.log('⚠️  Not on orders page. Please navigate to your orders and try again.');
    await browser.close();
    return [];
  }

  console.log('\n🔍 Starting to scrape orders...\n');

  const allOrders: AmazonOrder[] = [];
  let pageNum = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    console.log(`📄 Scraping page ${pageNum}...`);

    // Wait for orders to load
    await page.waitForSelector('.order-card, .order', { timeout: 10000 }).catch(() => null);

    // Scrape orders on current page
    const ordersOnPage = await page.evaluate(() => {
      const orders: Array<{
        orderId: string;
        orderDate: string;
        total: string;
        items: Array<{ title: string; price: string | null; quantity: number }>;
      }> = [];

      // Find all order cards
      const orderCards = document.querySelectorAll('.order-card, [class*="order-card"]');

      orderCards.forEach((card) => {
        try {
          // Order ID
          const orderIdEl = card.querySelector('[class*="order-id"] span, .yohtmlc-order-id span');
          const orderId = orderIdEl?.textContent?.trim() || '';

          // Order date
          const dateEl = card.querySelector('[class*="order-placed"] .value, .a-color-secondary');
          const orderDate = dateEl?.textContent?.trim() || '';

          // Total
          const totalEl = card.querySelector('[class*="order-total"] .value, .yohtmlc-order-total .value');
          const total = totalEl?.textContent?.trim() || '$0.00';

          // Items
          const items: Array<{ title: string; price: string | null; quantity: number }> = [];
          const itemEls = card.querySelectorAll('[class*="product-title"], .yohtmlc-product-title, a[href*="/gp/product/"]');

          itemEls.forEach((itemEl) => {
            const title = itemEl.textContent?.trim() || '';
            if (title && title.length > 0) {
              items.push({
                title,
                price: null, // Individual item prices often not visible
                quantity: 1,
              });
            }
          });

          if (orderId || items.length > 0) {
            orders.push({
              orderId,
              orderDate,
              total,
              items,
            });
          }
        } catch (e) {
          console.error('Error parsing order card:', e);
        }
      });

      return orders;
    });

    // Parse and add orders
    for (const order of ordersOnPage) {
      allOrders.push({
        orderId: order.orderId,
        orderDate: parseAmazonDate(order.orderDate),
        total: parsePrice(order.total),
        items: order.items.map((item) => ({
          title: item.title,
          price: item.price ? parsePrice(item.price) : null,
          quantity: item.quantity,
        })),
      });
    }

    console.log(`   Found ${ordersOnPage.length} orders on this page`);

    // Check for next page
    const nextButton = await page.$('a.s-pagination-next:not(.s-pagination-disabled), [class*="pagination-next"]:not([aria-disabled="true"])');

    if (nextButton) {
      await nextButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000)); // Wait for content to load
      pageNum++;
    } else {
      hasNextPage = false;
    }

    // Safety limit
    if (pageNum > 50) {
      console.log('⚠️  Reached page limit (50). Stopping.');
      break;
    }
  }

  await browser.close();

  console.log(`\n✅ Scraped ${allOrders.length} orders total\n`);

  return allOrders;
}

function parseAmazonDate(dateStr: string): Date {
  // Handle formats like "January 15, 2025" or "Jan 15, 2025"
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
  const outputFile = process.argv[3] || `amazon-orders-${year}.json`;

  console.log(`Scraping Amazon orders for ${year}...`);

  const orders = await scrapeAmazonOrders(year);

  if (orders.length === 0) {
    console.log('No orders found.');
    return;
  }

  // Filter prompt
  const filterByBuyer = await prompt('Filter by buyer name? (leave empty to include all): ');

  let filteredOrders = orders;
  if (filterByBuyer.trim()) {
    // Note: Buyer info may not be available on all order cards
    // This is a placeholder for when we can extract that info
    console.log(`Note: Buyer filtering requires expanding order details.`);
    console.log(`For now, saving all orders. You can filter manually in the JSON.`);
  }

  // Save to file
  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(filteredOrders, null, 2));

  console.log(`\n📁 Saved ${filteredOrders.length} orders to: ${outputPath}`);

  // Summary
  const totalSpent = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  console.log(`\n📊 Summary:`);
  console.log(`   Total orders: ${filteredOrders.length}`);
  console.log(`   Total spent: $${totalSpent.toFixed(2)}`);
}

main().catch(console.error);
