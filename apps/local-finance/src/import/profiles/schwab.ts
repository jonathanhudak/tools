// Charles Schwab CSV profile

import type { BankProfile } from '../../core/types.js';

export const schwabCheckingProfile: BankProfile = {
  id: 'schwab-checking',
  name: 'Charles Schwab Checking',
  patterns: [
    {
      headers: ['Date', 'Type', 'Check #', 'Description', 'Withdrawal', 'Deposit', 'Balance'],
    },
    // Alternative format
    {
      headers: ['Date', 'Type', 'CheckNumber', 'Description', 'Withdrawal', 'Deposit', 'RunningBalance'],
    },
  ],
  columnMapping: {
    date: 'Date',
    description: 'Description',
    debit: 'Withdrawal',
    credit: 'Deposit',
    balance: 'Balance',
  },
  dateFormat: 'MM/DD/YYYY',
  amountFormat: {
    negativeIndicator: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  skipRows: 0,
};

export const schwabBrokerageProfile: BankProfile = {
  id: 'schwab-brokerage',
  name: 'Charles Schwab Brokerage',
  patterns: [
    {
      headers: [
        'Date',
        'Action',
        'Symbol',
        'Description',
        'Quantity',
        'Price',
        'Fees & Comm',
        'Amount',
      ],
    },
  ],
  columnMapping: {
    date: 'Date',
    description: 'Description',
    amount: 'Amount',
  },
  dateFormat: 'MM/DD/YYYY',
  amountFormat: {
    negativeIndicator: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  skipRows: 0,
};
