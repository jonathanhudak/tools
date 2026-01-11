// Run this in the browser console while logged into Amazon orders page
// It will scrape all pages and save to a JSON file you can download

const ALLOWED_RECIPIENTS = ['Jonathan', 'Euguenia'];
const allOrders = [];

const scrapePage = () => {
  const orders = [];
  const orderIdElements = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        if (node.textContent.trim().match(/^\d{3}-\d{7}-\d{7}$/)) {
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
        const orderIdMatches = text.match(/\d{3}-\d{7}-\d{7}/g);
        if (orderIdMatches && orderIdMatches.length === 1) break;
      }
    }

    if (!container) continue;
    const text = container.innerText;

    const dateMatch = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/);
    const orderDate = dateMatch ? dateMatch[0] : '';

    const totalMatch = text.match(/TOTAL\s+\$?([\d,]+\.\d{2})/);
    const total = totalMatch ? totalMatch[1] : '0.00';

    let recipient = '';
    const shipToMatch = text.match(/SHIP TO\s+([^\n]+?)(?:\s+ORDER(?:ED BY)?|\s+ORDER #)/);
    const pickupAtMatch = text.match(/PICKUP AT\s+([^\n]+?)(?:\s+ORDER #)/);

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

  return orders;
};

const scrapeAllPages = async () => {
  const baseUrl = 'https://www.amazon.com/your-orders/orders?timeFilter=year-2025';
  let currentPage = 0;
  const maxPages = 38;

  console.log('Starting to scrape all pages...');

  while (currentPage < maxPages) {
    console.log(`Scraping page ${currentPage + 1}/${maxPages}...`);

    const pageOrders = scrapePage();
    allOrders.push(...pageOrders);
    console.log(`  Found ${pageOrders.length} matching orders. Total so far: ${allOrders.length}`);

    if (currentPage < maxPages - 1) {
      // Navigate to next page
      const nextUrl = `${baseUrl}&startIndex=${(currentPage + 1) * 10}`;
      window.location.href = nextUrl;

      // Wait for page load
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 2000);
        } else {
          window.addEventListener('load', () => setTimeout(resolve, 2000));
        }
      });
    }

    currentPage++;
  }

  console.log(`\nScraping complete!`);
  console.log(`Total orders found: ${allOrders.length}`);

  const totalSpent = allOrders.reduce((sum, o) => sum + o.total, 0);
  console.log(`Total spent: $${totalSpent.toFixed(2)}`);

  // Create downloadable JSON file
  const dataStr = JSON.stringify(allOrders, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'amazon-orders-2025-filtered.json';
  link.click();

  return allOrders;
};

// Start scraping
scrapeAllPages().then(orders => {
  console.log('Done! Check your downloads folder for amazon-orders-2025-filtered.json');
  console.log(`Downloaded ${orders.length} orders`);
}).catch(err => {
  console.error('Error during scraping:', err);
});
