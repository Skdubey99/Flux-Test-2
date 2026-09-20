export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number | string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  account?: string;
}

export type ViewMode = 'dashboard' | 'transactions' | 'borrowings' | 'todos' | 'salary' | 'analytics' | 'settings' | 'users';

export type SalaryFrequency = 'monthly' | 'biweekly' | 'weekly' | 'annual';

export interface SalaryAllocationSection {
  id: string | number;
  name: string;
  percentage: number; // e.g. 25 for 25%
  amount: number; // e.g. 36250
  color: string; // e.g. '#3B82F6'
  categoryMatching?: string; // category in transactions to correlate spending against
  notes?: string;
}

export interface SalaryConfig {
  amount: number;
  frequency: SalaryFrequency;
  title?: string;
  payday?: string; // e.g. "1st of the month"
  lastUpdated: string;
  sections: SalaryAllocationSection[];
}

export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoCategory = 'financial' | 'bills' | 'debts' | 'personal' | 'general';

export interface TodoItem {
  id: string | number;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  category: TodoCategory;
  dueDate?: string; // YYYY-MM-DD
  amount?: number; // optional associated financial amount (e.g. bill or debt)
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreditCardBorrowing {
  id: string | number;
  cardName: string;
  bankOrIssuer: string;
  amountBorrowed: number;
  creditLimit?: number;
  billingDueDate?: string;
  apr?: number;
  notes?: string;
  lastUpdated: string;
}

export interface FriendRepayment {
  id: string | number;
  date: string;
  amount: number;
  note?: string;
}

export interface FriendBorrowing {
  id: string | number;
  friendName: string;
  amountBorrowed: number; // remaining balance
  originalAmount: number; // initial amount borrowed
  borrowedDate: string;
  expectedPaybackDate?: string;
  status: 'active' | 'partial' | 'settled';
  notes?: string;
  phoneOrContact?: string;
  lastUpdated: string;
  repayments?: FriendRepayment[];
}

export type TimeRange = '7d' | '14d' | '30d' | 'all';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  label: string;
}

export interface SummaryStats {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}

export type UIColorId = 'indigo' | 'emerald' | 'blue' | 'violet' | 'rose' | 'amber' | 'teal' | 'slate';

export type HeaderStyleId = 'pure-light' | 'soft-cloud' | 'luminous-tint' | 'elevated-dark';

export interface UIColorTheme {
  id: UIColorId;
  name: string;
  description: string;
  hex: string;
  darkHex: string;
  hoverHex: string;
  lightBgHex: string;
  lightBorderHex: string;
  glowRgba: string;
  classes: {
    primaryBg: string;
    primaryText: string;
    lightBg: string;
    border: string;
    badge: string;
    activeNav: string;
    shadow: string;
    ring: string;
  };
}

export interface UserProfile {
  id: string;
  loginId: string; // Unique lowercase login identifier, e.g. "alex_rivera"
  name: string;
  avatarColor: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt: string;
  vaultVersion: number;
  email?: string;
  notes?: string;
  authProvider?: 'firebase_google' | 'login_id';
  firebaseUid?: string;
}

export interface UserSession {
  loginId: string;
  token: string;
  loginTime: string;
  authProvider?: 'firebase_google' | 'login_id';
  firebaseUid?: string;
}

export interface GoogleSheetSyncInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedAt: string;
}

export interface UserVaultData {
  transactions: Transaction[];
  creditCards: CreditCardBorrowing[];
  friendBorrowings: FriendBorrowing[];
  todos: TodoItem[];
  salaryConfig: SalaryConfig;
  currency: CurrencyConfig;
  uiColor: UIColorId;
  headerStyle: HeaderStyleId;
  theme: 'dark' | 'light';
  googleSheetSync?: GoogleSheetSyncInfo;
  firebaseSyncedAt?: string;
}
