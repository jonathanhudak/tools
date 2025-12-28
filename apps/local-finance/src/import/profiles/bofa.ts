// Bank of America CSV profile

import type { BankProfile } from '../../core/types.js';

export const bofaProfile: BankProfile = {
  id: 'bofa',
  name: 'Bank of America',
  patterns: [
    // Standard checking/savings format
    { headers: ['Date', 'Description', 'Amount', 'Running Bal.'] },
    // Credit card format
    { headers: ['Posted Date', 'Reference Number', 'Payee', 'Address', 'Amount'] },
    // Alternative format
    { headers: ['Date', 'Description', 'Amount', 'Balance'] },
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

// Credit card specific mapping
export const bofaCreditProfile: BankProfile = {
  id: 'bofa-credit',
  name: 'Bank of America Credit Card',
  patterns: [
    { headers: ['Posted Date', 'Reference Number', 'Payee', 'Address', 'Amount'] },
  ],
  columnMapping: {
    date: 'Posted Date',
    description: 'Payee',
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
