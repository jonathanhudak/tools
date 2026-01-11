// Import Amazon orders from JSON
import fs from 'fs';
import path from 'path';
import {
  getDatabase,
  createAccount,
  getAccountByName,
  insertTransaction,
  transactionExists,
  createImport,
} from './core/database.js';
import { generateImportHash } from './import/csv-parser.js';
import { getDatabasePath, ensureDataDir } from './core/config.js';

interface AmazonOrder {
  orderId: string;
  orderDate: string;
  total: number;
  recipient: string;
  items?: Array<{
    title: string;
    price: number | null;
    quantity: number;
  }>;
}

async function importAmazonOrders(filePath: string): Promise<void> {
  console.log(`\nImporting Amazon orders from: ${filePath}\n`);

  // Read JSON file
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const orders: AmazonOrder[] = JSON.parse(fileContents);

  console.log(`Found ${orders.length} Amazon orders`);

  // Setup database
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Get or create Amazon account
  let account = getAccountByName(db, 'Amazon');
  if (!account) {
    account = createAccount(db, 'Amazon', 'amazon', 'credit');
    console.log('Created Amazon account\n');
  }

  let imported = 0;
  let skipped = 0;

  for (const order of orders) {
    const date = new Date(order.orderDate);
    const description = `Amazon Order #${order.orderId} - ${order.recipient}`;
    const amount = -Math.abs(order.total); // Negative for purchases

    const importHash = generateImportHash(date, description, amount, account.id);

    if (transactionExists(db, importHash)) {
      skipped++;
      continue;
    }

    insertTransaction(db, {
      accountId: account.id,
      date,
      description,
      normalizedMerchant: 'Amazon',
      amount,
      categoryId: null,
      categorySource: null,
      categoryConfidence: null,
      isRecurring: false,
      recurringId: null,
      notes: JSON.stringify({ orderId: order.orderId, recipient: order.recipient }),
      rawCsvRow: JSON.stringify(order),
      importHash,
    });

    imported++;
  }

  // Record import
  createImport(db, {
    filename: path.basename(filePath),
    bankProfile: 'amazon',
    accountId: account.id,
    rowCount: orders.length,
    importedCount: imported,
    skippedCount: skipped,
  });

  console.log(`\n✅ Imported ${imported} Amazon orders (${skipped} duplicates skipped)\n`);
}

// Run if called directly
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: tsx src/import-amazon.ts <path-to-amazon-orders.json>');
  process.exit(1);
}

importAmazonOrders(args[0]).catch((err) => {
  console.error('Error importing Amazon orders:', err);
  process.exit(1);
});
