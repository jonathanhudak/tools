// Chase CSV profile

import type { BankProfile } from '../../core/types.js';

export const chaseProfile: BankProfile = {
  id: 'chase',
  name: 'Chase',
  patterns: [
    // Credit card format
    {
      headers: [
        'Transaction Date',
        'Post Date',
        'Description',
        'Category',
        'Type',
        'Amount',
      ],
    },
    // With memo
    {
      headers: [
        'Transaction Date',
        'Post Date',
        'Description',
        'Category',
        'Type',
        'Amount',
        'Memo',
      ],
    },
    // Checking format
    {
      headers: ['Details', 'Posting Date', 'Description', 'Amount', 'Type', 'Balance', 'Check or Slip #'],
    },
  ],
  columnMapping: {
    date: 'Transaction Date',
    description: 'Description',
    amount: 'Amount',
    category: 'Category',
  },
  dateFormat: 'MM/DD/YYYY',
  amountFormat: {
    negativeIndicator: 'prefix',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  skipRows: 0,
};

export const chaseCheckingProfile: BankProfile = {
  id: 'chase-checking',
  name: 'Chase Checking',
  patterns: [
    {
      headers: ['Details', 'Posting Date', 'Description', 'Amount', 'Type', 'Balance', 'Check or Slip #'],
    },
  ],
  columnMapping: {
    date: 'Posting Date',
    description: 'Description',
    amount: 'Amount',
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
