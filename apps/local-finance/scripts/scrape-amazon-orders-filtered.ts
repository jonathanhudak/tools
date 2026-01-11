// Amazon Order Scraper with Recipient Filtering
// Run with: npx tsx scripts/scrape-amazon-orders-filtered.ts

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

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

async function scrapeAmazonOrders(year: number = 2025): Promise<AmazonOrder[]> {
  console.log('\n🛒 Amazon Order Scraper (Auto Mode)\n');
  console.log('Filtering for recipients: Jonathan, Euguenia\n');

  // Launch browser in non-headless mode
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Navigate to orders page
  const ordersUrl = `${AMAZON_ORDERS_URL}?timeFilter=year-${year}`;
  console.log(`Opening: ${ordersUrl}\n`);
  await page.goto(ordersUrl, { waitUntil: 'networkidle2' });

  // Check if we need to log in
  const currentUrl = page.url();
  if (currentUrl.includes('/ap/signin')) {
    console.log('🔐 Signing in automatically...\n');

    const email = process.env.AMAZON_EMAIL;
    const password = process.env.AMAZON_PASSWORD;

    if (!email || !password) {
      console.log('⚠️  Missing credentials. Set AMAZON_EMAIL and AMAZON_PASSWORD environment variables.');
      console.log('   Or manually log in within the next 30 seconds...\n');
      await new Promise(r => setTimeout(r, 30000));
    } else {
      // Fill email/phone
      await page.waitForSelector('#ap_email, input[name="email"]', { timeout: 5000 });
      await page.type('#ap_email, input[name="email"]', email);
      await page.click('#continue, input[id="continue"]');

      // Wait for password field
      await page.waitForSelector('#ap_password, input[name="password"]', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 1500));

      // Dismiss any popups/modals that might appear
      try {
        const dismissButtons = await page.$$('button[data-action="a-popover-close"], [aria-label="Close"], button:has-text("No thanks"), button:has-text("Dismiss")');
        for (const btn of dismissButtons) {
          await btn.click().catch(() => {});
        }
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        // No popups to dismiss
      }

      await page.type('#ap_password, input[name="password"]', password);

      // Click sign in
      await page.click('#signInSubmit, input[id="signInSubmit"]');

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
        console.log('   Navigation timeout, continuing...');
      });

      console.log('✅ Signed in successfully\n');

      // Navigate to orders page again if needed
      if (!page.url().includes('your-orders')) {
        console.log('Navigating to orders page...\n');
        await page.goto(ordersUrl, { waitUntil: 'networkidle2' });
      }
    }
  }

  // Wait a bit for page to fully load
  console.log('⏳ Waiting for page to fully load...\n');
  await new Promise(r => setTimeout(r, 5000));

  // Check if we're on the orders page
  if (!page.url().includes('your-orders')) {
    console.log('⚠️  Warning: Not on orders page. Attempting to continue anyway...');
  }

  console.log('🔍 Starting to scrape orders...\n');

  const allOrders: AmazonOrder[] = [];
  let pageNum = 1;
  let hasNextPage = true;

  while (hasNextPage && pageNum <= 20) {
    console.log(`📄 Scraping page ${pageNum}...`);

    // Wait for orders to load
    await page.waitForSelector('[data-test-id="order-card"], .order-card, .order, .a-box-group', { timeout: 15000 }).catch(() => {
      console.log('   Timeout waiting for orders, continuing anyway...');
    });

    await new Promise(r => setTimeout(r, 2000));

    // Debug: take a screenshot
    await page.screenshot({ path: `debug-page-${pageNum}.png`, fullPage: false });
    console.log(`   Saved debug screenshot: debug-page-${pageNum}.png`);

    // Get all order IDs on the page to click into for details
    const orderCardLinks = await page.evaluate(() => {
      const links: string[] = [];

      // Try multiple selectors for order cards
      const selectors = [
        '[data-test-id="order-card"]',
        '.order-card',
        '.a-box-group.order',
        '[class*="order-card"]',
        '[data-order-id]'
      ];

      let allCards: Element[] = [];
      for (const selector of selectors) {
        const cards = Array.from(document.querySelectorAll(selector));
        allCards = allCards.concat(cards);
      }

      // Remove duplicates
      const uniqueCards = Array.from(new Set(allCards));

      console.log(`Found ${uniqueCards.length} order cards with various selectors`);

      uniqueCards.forEach((card, idx) => {
        // Try multiple selectors for order details link
        const detailsSelectors = [
          'a[href*="/gp/your-account/order-details"]',
          'a[href*="order-details"]',
          'a:has-text("Order details")',
          'a[class*="order-details"]'
        ];

        for (const selector of detailsSelectors) {
          const detailsLink = card.querySelector(selector);
          if (detailsLink) {
            const href = (detailsLink as HTMLAnchorElement).href;
            if (href && !links.includes(href)) {
              links.push(href);
              console.log(`Card ${idx}: Found order link ${href}`);
              break;
            }
          }
        }

        // If no link found, look for data attributes
        if (card.hasAttribute('data-order-id')) {
          const orderId = card.getAttribute('data-order-id');
          console.log(`Card ${idx}: Has order ID ${orderId} in data attribute`);
        }
      });

      return links;
    });

    console.log(`   Found ${orderCardLinks.length} order detail links`);

    // Visit each order detail page to get recipient
    for (const orderLink of orderCardLinks.slice(0, 10)) { // Limit to 10 per page for now
      try {
        await page.goto(orderLink, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting

        const orderData = await page.evaluate(() => {
          // Extract order ID
          const orderIdEl = document.querySelector('[data-test-id="order-id"], .order-date-invoice-item span, bdi');
          let orderId = '';
          if (orderIdEl) {
            const text = orderIdEl.textContent || '';
            const match = text.match(/\d{3}-\d{7}-\d{7}/);
            orderId = match ? match[0] : '';
          }

          // Extract order date
          const dateEl = document.querySelector('.order-date-invoice-item, [class*="order-date"]');
          const orderDateStr = dateEl?.textContent?.trim() || '';

          // Extract total
          const totalEl = document.querySelector('[class*="grand-total"] .value, .order-summary .a-text-bold');
          const totalStr = totalEl?.textContent?.trim() || '$0.00';

          // Extract recipient from shipping address
          let recipient = '';
          const shipToEl = document.querySelector('[class*="shipToText"], .displayAddressDiv');
          if (shipToEl) {
            const shipText = shipToEl.textContent || '';
            const lines = shipText.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length > 0) {
              recipient = lines[0]; // First line usually has the name
            }
          }

          // Extract items
          const items: Array<{ title: string; price: string | null; quantity: number }> = [];
          const itemEls = document.querySelectorAll('[class*="product-row"], .a-fixed-left-grid');

          itemEls.forEach((itemEl) => {
            const titleEl = itemEl.querySelector('[class*="product-title"], a[class*="link"]');
            const title = titleEl?.textContent?.trim() || '';

            if (title && title.length > 3) {
              items.push({
                title,
                price: null,
                quantity: 1,
              });
            }
          });

          return {
            orderId,
            orderDate: orderDateStr,
            total: totalStr,
            recipient,
            items,
          };
        });

        // Parse and add order
        if (orderData.orderId && orderData.recipient) {
          // Check if recipient matches our filter
          const matchesFilter = ALLOWED_RECIPIENTS.some(name =>
            orderData.recipient.toLowerCase().includes(name.toLowerCase())
          );

          if (matchesFilter) {
            allOrders.push({
              orderId: orderData.orderId,
              orderDate: parseAmazonDate(orderData.orderDate),
              total: parsePrice(orderData.total),
              recipient: orderData.recipient,
              items: orderData.items.map(item => ({
                title: item.title,
                price: item.price ? parsePrice(item.price) : null,
                quantity: item.quantity,
              })),
            });
            console.log(`   ✓ Added order ${orderData.orderId} (${orderData.recipient})`);
          } else {
            console.log(`   ✗ Skipped order ${orderData.orderId} (${orderData.recipient})`);
          }
        }

        // Go back to orders list
        await page.goBack({ waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.log(`   Error processing order: ${error}`);
      }
    }

    // Check for next page
    const nextButton = await page.$('a.s-pagination-next:not(.s-pagination-disabled), li.a-last:not(.a-disabled) a');

    if (nextButton) {
      console.log('   Going to next page...\n');
      await nextButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      await new Promise((r) => setTimeout(r, 3000)); // Wait longer between pages
      pageNum++;
    } else {
      hasNextPage = false;
    }
  }

  await browser.close();

  console.log(`\n✅ Scraped ${allOrders.length} orders for Jonathan/Euguenia\n`);

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

  // Save to file
  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(orders, null, 2));

  console.log(`📁 Saved ${orders.length} orders to: ${outputPath}`);

  // Summary
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  console.log(`\n📊 Summary:`);
  console.log(`   Total orders: ${orders.length}`);
  console.log(`   Total spent: $${totalSpent.toFixed(2)}\n`);

  // Breakdown by recipient
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
