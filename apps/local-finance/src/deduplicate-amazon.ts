// Deduplicate Amazon transactions
// Matches Amazon order entries with Chase Amazon transactions

import {
  getDatabase,
  getAccountByName,
} from './core/database.js';
import { getDatabasePath, ensureDataDir } from './core/config.js';

interface Transaction {
  id: number;
  account_id: number;
  date: string;
  description: string;
  amount: number;
  notes: string | null;
  raw_csv_row: string;
}

interface Match {
  chaseTransaction: Transaction;
  amazonOrder: Transaction;
  dateDiff: number;
  amountDiff: number;
}

async function deduplicateAmazon(): Promise<void> {
  console.log('\n🔍 Amazon Transaction Deduplication\n');

  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Get account IDs
  const amazonAccount = getAccountByName(db, 'Amazon');
  if (!amazonAccount) {
    console.log('❌ No Amazon account found. Import Amazon orders first.');
    return;
  }

  const chaseAccounts = [
    getAccountByName(db, 'Chase Checking 7219'),
    getAccountByName(db, 'Chase Credit 0614'),
    getAccountByName(db, 'Chase Credit 9217'),
  ].filter(Boolean);

  if (chaseAccounts.length === 0) {
    console.log('❌ No Chase accounts found.');
    return;
  }

  const chaseAccountIds = chaseAccounts.map(a => a!.id);

  // Get all Amazon orders
  const amazonOrders = db.prepare(`
    SELECT id, account_id, date, description, amount, notes, raw_csv_row
    FROM transactions
    WHERE account_id = ?
    ORDER BY date DESC
  `).all(amazonAccount.id) as Transaction[];

  console.log(`Found ${amazonOrders.length} Amazon orders`);

  // Get all Chase Amazon transactions
  const placeholders = chaseAccountIds.map(() => '?').join(',');
  const chaseAmazonTransactions = db.prepare(`
    SELECT id, account_id, date, description, amount, notes, raw_csv_row
    FROM transactions
    WHERE account_id IN (${placeholders})
      AND (description LIKE '%AMAZON%' OR description LIKE '%AMZN%' OR description LIKE '%Prime Video%')
    ORDER BY date DESC
  `).all(...chaseAccountIds) as Transaction[];

  console.log(`Found ${chaseAmazonTransactions.length} Chase Amazon transactions\n`);

  // Match transactions
  const matches: Match[] = [];
  const matched = new Set<number>();

  for (const order of amazonOrders) {
    const orderDate = new Date(order.date);
    const orderAmount = Math.abs(order.amount);

    for (const chaseTransaction of chaseAmazonTransactions) {
      if (matched.has(chaseTransaction.id)) continue;

      const chaseDate = new Date(chaseTransaction.date);
      const chaseAmount = Math.abs(chaseTransaction.amount);

      // Calculate date difference in days
      const dateDiff = Math.abs(
        (orderDate.getTime() - chaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate amount difference
      const amountDiff = Math.abs(orderAmount - chaseAmount);

      // Match criteria: within 5 days and amount within $0.50
      if (dateDiff <= 5 && amountDiff <= 0.50) {
        matches.push({
          chaseTransaction,
          amazonOrder: order,
          dateDiff,
          amountDiff,
        });
        matched.add(chaseTransaction.id);
        break; // Only match each order once
      }
    }
  }

  console.log(`📊 Found ${matches.length} matches\n`);

  if (matches.length === 0) {
    console.log('No duplicates found. All transactions are unique.');
    return;
  }

  // Show preview of matches
  console.log('Preview of matches (first 10):\n');
  for (const match of matches.slice(0, 10)) {
    const orderDate = new Date(match.amazonOrder.date).toISOString().split('T')[0];
    const chaseDate = new Date(match.chaseTransaction.date).toISOString().split('T')[0];

    console.log(`Match:`);
    console.log(`  Amazon Order: ${orderDate} $${Math.abs(match.amazonOrder.amount).toFixed(2)}`);
    console.log(`  Chase Trans:  ${chaseDate} $${Math.abs(match.chaseTransaction.amount).toFixed(2)} - ${match.chaseTransaction.description.slice(0, 50)}`);
    console.log(`  Diff: ${match.dateDiff.toFixed(1)} days, $${match.amountDiff.toFixed(2)}\n`);
  }

  if (matches.length > 10) {
    console.log(`... and ${matches.length - 10} more matches\n`);
  }

  // Mark Chase transactions as duplicates
  const deleteStmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  const updateStmt = db.prepare(`
    UPDATE transactions
    SET notes = ?
    WHERE id = ?
  `);

  let deleted = 0;

  for (const match of matches) {
    // Update Amazon order notes to reference the Chase transaction
    const orderNotes = match.amazonOrder.notes
      ? JSON.parse(match.amazonOrder.notes)
      : {};

    orderNotes.chaseTransactionId = match.chaseTransaction.id;
    orderNotes.chaseDescription = match.chaseTransaction.description;

    updateStmt.run(JSON.stringify(orderNotes), match.amazonOrder.id);

    // Delete the Chase duplicate
    deleteStmt.run(match.chaseTransaction.id);
    deleted++;
  }

  console.log(`✅ Deleted ${deleted} duplicate Chase Amazon transactions`);
  console.log(`✅ Kept ${matches.length} Amazon order records with full details\n`);

  // Summary
  const remainingAmazon = db.prepare(`
    SELECT COUNT(*) as count
    FROM transactions
    WHERE account_id IN (${placeholders})
      AND (description LIKE '%AMAZON%' OR description LIKE '%AMZN%' OR description LIKE '%Prime Video%')
  `).get(...chaseAccountIds) as { count: number };

  console.log(`📊 Summary:`);
  console.log(`   Amazon orders: ${amazonOrders.length}`);
  console.log(`   Remaining Chase Amazon transactions (unmatched): ${remainingAmazon.count}`);
  console.log(`   Total Amazon-related transactions: ${amazonOrders.length + remainingAmazon.count}\n`);
}

// Run if called directly
deduplicateAmazon().catch((err) => {
  console.error('Error deduplicating Amazon transactions:', err);
  process.exit(1);
});
