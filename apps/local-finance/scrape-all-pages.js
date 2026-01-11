const fs = require('fs');

// This will be run multiple times, aggregating results
const SCRIPT_TO_RUN = `
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
    orders.push({ orderId, orderDate, total: total.replace(/,/g, ''), recipient });
  }
}

const allLinks = Array.from(document.querySelectorAll('a'));
const nextLink = allLinks.find(link => 
  link.textContent.includes('Next') && link.href.includes('startIndex')
);

({ pageOrders: orders.length, orders: orders, hasNext: !!nextLink, nextUrl: nextLink ? nextLink.href : null })
`;

console.log(SCRIPT_TO_RUN);
