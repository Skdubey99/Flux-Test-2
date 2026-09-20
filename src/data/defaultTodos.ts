import { TodoItem } from '../types';

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

export const INITIAL_TODOS: TodoItem[] = [
  {
    id: 'todo-1',
    title: 'Pay Sapphire Reserve credit card balance',
    description: 'Pay statement balance before due date to avoid 21.99% APR interest charge.',
    completed: false,
    priority: 'high',
    category: 'bills',
    dueDate: getFutureDateOffset(5),
    amount: 4250,
    createdAt: getDateOffset(2),
  },
  {
    id: 'todo-2',
    title: 'Repay partial loan to Alex Carter',
    description: 'Send $500 payment via Zelle towards mountain cabin shared booking.',
    completed: false,
    priority: 'high',
    category: 'debts',
    dueDate: getFutureDateOffset(10),
    amount: 500,
    createdAt: getDateOffset(4),
  },
  {
    id: 'todo-3',
    title: 'Audit recurring SaaS & streaming subscriptions',
    description: 'Review bank statement for unused cloud storage, fitness apps, and streaming trials.',
    completed: false,
    priority: 'medium',
    category: 'financial',
    dueDate: getFutureDateOffset(7),
    createdAt: getDateOffset(1),
  },
  {
    id: 'todo-4',
    title: 'Move quarterly tax reserve into high-yield savings',
    description: 'Transfer 25% of recent freelance earnings into high-yield savings vault.',
    completed: false,
    priority: 'medium',
    category: 'financial',
    amount: 1800,
    dueDate: getFutureDateOffset(14),
    createdAt: getDateOffset(3),
  },
  {
    id: 'todo-5',
    title: 'Collect receipts for business trip reimbursement',
    description: 'Export PDF invoices for flight, hotel, and client dinner receipts.',
    completed: true,
    priority: 'low',
    category: 'personal',
    amount: 420,
    dueDate: getDateOffset(1),
    completedAt: getDateOffset(1),
    createdAt: getDateOffset(6),
  },
  {
    id: 'todo-6',
    title: 'Set monthly budget limit for dining & takeout',
    description: 'Cap weekend food delivery orders at $350 for the upcoming month.',
    completed: true,
    priority: 'low',
    category: 'general',
    completedAt: getDateOffset(3),
    createdAt: getDateOffset(7),
  },
];
