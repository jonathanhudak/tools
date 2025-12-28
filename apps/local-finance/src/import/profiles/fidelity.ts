// Fidelity CSV profile

import type { BankProfile } from '../../core/types.js';

export const fidelityCashProfile: BankProfile = {
  id: 'fidelity-cash',
  name: 'Fidelity Cash Management',
  patterns: [
    {
      headers: ['Date', 'Transaction', 'Name', 'Memo', 'Amount'],
    },
    // Alternative format
    {
      headers: ['Date', 'Transaction Type', 'Name', 'Memo', 'Amount'],
    },
  ],
  columnMapping: {
    date: 'Date',
    description: 'Name',
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

export const fidelityBrokerageProfile: BankProfile = {
  id: 'fidelity-brokerage',
  name: 'Fidelity Brokerage',
  patterns: [
    {
      headers: [
        'Run Date',
        'Action',
        'Symbol',
        'Description',
        'Type',
        'Quantity',
        'Price',
        'Commission',
        'Fees',
        'Accrued Interest',
        'Amount',
        'Settlement Date',
      ],
    },
    // Simpler format
    {
      headers: ['Run Date', 'Account', 'Action', 'Symbol', 'Description', 'Type', 'Quantity', 'Price', 'Commission', 'Fees', 'Accrued Interest', 'Amount', 'Cash Balance', 'Settlement Date'],
    },
  ],
  columnMapping: {
    date: 'Run Date',
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

export const fidelityCreditProfile: BankProfile = {
  id: 'fidelity-credit',
  name: 'Fidelity Credit Card',
  patterns: [
    {
      headers: ['Date', 'Transaction', 'Name', 'Memo', 'Amount'],
    },
  ],
  columnMapping: {
    date: 'Date',
    description: 'Name',
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
