import { SalaryConfig } from '../types';

export const INITIAL_SALARY_CONFIG: SalaryConfig = {
  amount: 145000,
  frequency: 'monthly',
  title: 'Primary Tech Salary',
  payday: '1st of the month',
  lastUpdated: new Date().toISOString().split('T')[0],
  sections: [
    {
      id: 'sec-housing',
      name: 'Housing & Utilities (Rent & Power)',
      percentage: 25,
      amount: 36250,
      color: '#3B82F6', // Blue
      categoryMatching: 'Rent',
      notes: 'Apartment lease, electric bill, fiber wifi',
    },
    {
      id: 'sec-savings',
      name: 'Emergency Fund & Liquid Savings',
      percentage: 20,
      amount: 29000,
      color: '#10B981', // Emerald
      categoryMatching: 'Savings',
      notes: 'High-yield savings vault for 6-month runway',
    },
    {
      id: 'sec-investments',
      name: 'Wealth Building & Equity Index',
      percentage: 15,
      amount: 21750,
      color: '#6366F1', // Indigo
      categoryMatching: 'Investment',
      notes: 'Automated SIP in index mutual funds & stocks',
    },
    {
      id: 'sec-debts',
      name: 'Debt Elimination (Credit Cards & Friends)',
      percentage: 15,
      amount: 21750,
      color: '#F59E0B', // Amber
      categoryMatching: 'Debt',
      notes: 'Pay off credit card balances and friend loans',
    },
    {
      id: 'sec-groceries',
      name: 'Groceries, Nutrition & Dining',
      percentage: 15,
      amount: 21750,
      color: '#EC4899', // Pink
      categoryMatching: 'Food',
      notes: 'Weekly fresh groceries, cooking essentials & dining',
    },
    {
      id: 'sec-lifestyle',
      name: 'Discretionary, Self-Care & Leisure',
      percentage: 10,
      amount: 14500,
      color: '#8B5CF6', // Purple
      categoryMatching: 'Entertainment',
      notes: 'Subscriptions, hobbies, cinema, and weekend leisure',
    },
  ],
};

export const SALARY_PRESETS = [
  {
    id: 'preset-50-30-20',
    name: '50/30/20 Standard Rule',
    description: 'Classic personal finance rule: 50% Needs, 30% Wants, 20% Savings & Debt.',
    sections: [
      { name: 'Needs & Fixed Essentials', percentage: 50, color: '#3B82F6', categoryMatching: 'Rent', notes: 'Rent, bills, groceries, transport' },
      { name: 'Wants & Discretionary', percentage: 30, color: '#8B5CF6', categoryMatching: 'Entertainment', notes: 'Dining out, hobbies, shopping, subscriptions' },
      { name: 'Savings, Investments & Debts', percentage: 20, color: '#10B981', categoryMatching: 'Savings', notes: 'Emergency fund, debt payoff, index funds' },
    ],
  },
  {
    id: 'preset-60-20-20',
    name: '60/20/20 Balanced Growth',
    description: '60% Essential living, 20% Wealth & investments, 20% Personal freedom.',
    sections: [
      { name: 'Living Expenses & Essentials', percentage: 60, color: '#3B82F6', categoryMatching: 'Rent', notes: 'Housing, utilities, groceries, transport' },
      { name: 'Long-term Wealth & Investments', percentage: 20, color: '#6366F1', categoryMatching: 'Investment', notes: 'Retirement, stocks, real estate fund' },
      { name: 'Discretionary & Lifestyle', percentage: 20, color: '#EC4899', categoryMatching: 'Entertainment', notes: 'Fun money, guilt-free spending' },
    ],
  },
  {
    id: 'preset-debt-crusher',
    name: 'Aggressive Debt Payoff',
    description: 'Prioritize eliminating credit card debt and loans rapidly while covering essentials.',
    sections: [
      { name: 'Lean Essentials & Housing', percentage: 40, color: '#3B82F6', categoryMatching: 'Rent', notes: 'Bare essentials to keep bills current' },
      { name: 'Debt Repayment Accelerator', percentage: 35, color: '#F59E0B', categoryMatching: 'Debt', notes: 'Pay down high-interest credit cards & friends' },
      { name: 'Emergency Buffer', percentage: 15, color: '#10B981', categoryMatching: 'Savings', notes: 'Safety net to prevent new borrowing' },
      { name: 'Pocket Money & Discretionary', percentage: 10, color: '#8B5CF6', categoryMatching: 'Entertainment', notes: 'Modest allowance for sanity' },
    ],
  },
  {
    id: 'preset-fire-investor',
    name: 'F.I.R.E. (High Savings & Investing)',
    description: 'Extreme wealth acceleration with 50%+ allocated towards investments.',
    sections: [
      { name: 'Index & Equity Investments', percentage: 45, color: '#6366F1', categoryMatching: 'Investment', notes: 'Index funds, ETFs, dividend portfolios' },
      { name: 'Frugal Living Essentials', percentage: 35, color: '#3B82F6', categoryMatching: 'Rent', notes: 'Housing, frugal meal prep, transit' },
      { name: 'High-Yield Liquid Savings', percentage: 10, color: '#10B981', categoryMatching: 'Savings', notes: 'Cash equivalents & emergency reserve' },
      { name: 'Guilt-Free Spending', percentage: 10, color: '#8B5CF6', categoryMatching: 'Entertainment', notes: 'Personal hobbies and travel' },
    ],
  },
];
