import { CreditCardBorrowing, FriendBorrowing } from '../types';

function getDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getFutureDateOffset(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export const INITIAL_CREDIT_CARDS: CreditCardBorrowing[] = [
  {
    id: 'cc-1',
    cardName: 'Sapphire Reserve',
    bankOrIssuer: 'Chase',
    amountBorrowed: 4250,
    creditLimit: 15000,
    billingDueDate: getFutureDateOffset(14),
    apr: 21.99,
    notes: 'Primary travel & dining card. Auto-pay minimum set.',
    lastUpdated: getDateOffset(1),
  },
  {
    id: 'cc-2',
    cardName: 'Neon Titanium Cash',
    bankOrIssuer: 'Apex Bank',
    amountBorrowed: 1850,
    creditLimit: 6000,
    billingDueDate: getFutureDateOffset(5),
    apr: 19.49,
    notes: 'Tech hardware purchases and subscriptions.',
    lastUpdated: getDateOffset(3),
  },
  {
    id: 'cc-3',
    cardName: 'Amazon Prime Rewards',
    bankOrIssuer: 'Synchrony',
    amountBorrowed: 680,
    creditLimit: 5000,
    billingDueDate: getFutureDateOffset(21),
    apr: 24.24,
    notes: 'Home pantry restock and office supplies.',
    lastUpdated: getDateOffset(5),
  },
];

export const INITIAL_FRIEND_BORROWINGS: FriendBorrowing[] = [
  {
    id: 'fr-1',
    friendName: 'Alex Carter',
    amountBorrowed: 1200,
    originalAmount: 2000,
    borrowedDate: getDateOffset(24),
    expectedPaybackDate: getFutureDateOffset(15),
    status: 'partial',
    notes: 'Shared mountain cabin rental booking advance.',
    phoneOrContact: '+1 (555) 234-5678',
    lastUpdated: getDateOffset(2),
    repayments: [
      {
        id: 'rep-1',
        date: getDateOffset(10),
        amount: 800,
        note: 'Half repayment sent via bank transfer',
      },
    ],
  },
  {
    id: 'fr-2',
    friendName: 'Priya Patel',
    amountBorrowed: 450,
    originalAmount: 450,
    borrowedDate: getDateOffset(8),
    expectedPaybackDate: getFutureDateOffset(7),
    status: 'active',
    notes: 'Music festival group pass & parking ticket.',
    phoneOrContact: 'priya.p@email.com',
    lastUpdated: getDateOffset(8),
    repayments: [],
  },
  {
    id: 'fr-3',
    friendName: 'Marcus Vance',
    amountBorrowed: 0,
    originalAmount: 600,
    borrowedDate: getDateOffset(45),
    expectedPaybackDate: getDateOffset(5),
    status: 'settled',
    notes: 'Camera lens repair assistance.',
    phoneOrContact: '+1 (555) 890-1234',
    lastUpdated: getDateOffset(5),
    repayments: [
      {
        id: 'rep-2',
        date: getDateOffset(5),
        amount: 600,
        note: 'Full settlement received via Venmo',
      },
    ],
  },
];
