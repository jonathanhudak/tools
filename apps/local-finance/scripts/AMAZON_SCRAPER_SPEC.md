# Amazon Order Scraper Specification

Instructions for an agent with Puppeteer tools to scrape Amazon order history.

## Input

**URL:** `https://www.amazon.com/your-orders/orders?timeFilter=year-2025`

**Authentication:** User must be logged into Amazon (session cookies required)

**Parameters:**
- `year`: The year to scrape (e.g., 2025)
- `buyerFilter` (optional): Name to filter orders by on shared accounts

## Output Format

Save to: `amazon-orders-2025.json`

```json
{
  "scrapedAt": "2025-01-15T10:30:00.000Z",
  "year": 2025,
  "totalOrders": 47,
  "totalSpent": 2341.56,
  "orders": [
    {
      "orderId": "112-1234567-1234567",
      "orderDate": "2025-01-15",
      "total": 47.99,
      "items": [
        {
          "title": "USB-C Cable 6ft 2-Pack Fast Charging",
          "quantity": 1
        },
        {
          "title": "Phone Stand Adjustable",
          "quantity": 2
        }
      ]
    }
  ]
}
```

### Field Specifications

| Field | Type | Format | Required |
|-------|------|--------|----------|
| `orderId` | string | `###-#######-#######` | Yes |
| `orderDate` | string | `YYYY-MM-DD` (ISO date) | Yes |
| `total` | number | Decimal USD (e.g., 47.99) | Yes |
| `items[].title` | string | Full product title | Yes |
| `items[].quantity` | number | Integer >= 1 | Yes |

## Scraping Instructions

### Step 1: Navigate to Orders Page
```
URL: https://www.amazon.com/your-orders/orders?timeFilter=year-2025
```

### Step 2: Wait for Page Load
Wait for selector: `.order-card` or `.a-box-group.order`

### Step 3: Extract Orders from Current Page

For each order card (`.order-card` or `.a-box-group.order`):

**Order Date:**
- Selector: `.order-info .a-color-secondary` containing date text
- Or: Text matching pattern `(January|February|...) \d{1,2}, \d{4}`
- Convert to ISO format: `YYYY-MM-DD`

**Order Total:**
- Selector: `.yohtmlc-order-total .value` or `.order-info span.a-color-secondary` containing `$`
- Parse: Remove `$` and commas, convert to float

**Order ID:**
- Selector: `.yohtmlc-order-id span` or element containing `ORDER # ` or `#\d{3}-\d{7}-\d{7}`
- Extract: Just the ID portion `###-#######-#######`

**Items:**
- Selector: `.yohtmlc-product-title` or `.a-link-normal[href*="/gp/product/"]`
- For each item, get the text content as `title`
- Default `quantity` to 1 (quantity not always visible on summary)

### Step 4: Pagination

Check for next page:
```
Selector: .a-pagination .a-last:not(.a-disabled) a
```

If exists and not disabled:
1. Click the next button
2. Wait for navigation/network idle
3. Wait 2 seconds (rate limiting)
4. Repeat Step 3

If not exists or disabled: pagination complete

### Step 5: Save Output

Write JSON file with all collected orders.

## Rate Limiting

- Wait 2-3 seconds between page navigations
- Maximum 50 pages per session (safety limit)

## Error Handling

| Error | Action |
|-------|--------|
| CAPTCHA detected | Stop, notify user |
| Login required | Stop, notify user |
| Element not found | Log warning, continue |
| Network error | Retry once, then skip page |

## Compatibility

This output is designed to correlate with bank transactions imported via:
```bash
finance import chase-2025.csv
```

Matching logic (to be implemented in `finance` CLI):
- Match by `orderDate` ± 3 days (shipping/processing delay)
- Match by `total` amount (exact or within $0.01)
- Use item titles to determine category (Electronics, Groceries, etc.)
