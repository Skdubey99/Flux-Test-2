import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, CreditCardBorrowing, FriendBorrowing, SalaryConfig, CurrencyConfig, GoogleSheetSyncInfo } from '../types';

// Ensure single Firebase app instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'consent',
});

// Flag to indicate ongoing sign-in
let isSigningIn = false;
// Cached in-memory only (never saved to localStorage per security mandate)
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleAccount = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign-in credentials.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getGoogleUser = (): User | null => {
  return auth.currentUser;
};

export const disconnectGoogleAccount = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Interface for export payload
export interface LedgerExportPayload {
  userName: string;
  loginId: string;
  transactions: Transaction[];
  creditCards: CreditCardBorrowing[];
  friendBorrowings: FriendBorrowing[];
  salaryConfig: SalaryConfig;
  currency: CurrencyConfig;
}

/**
 * Creates or updates a Google Spreadsheet in user's Google Drive with complete ledger data
 */
export async function syncLedgerToGoogleSheet(
  payload: LedgerExportPayload,
  existingSpreadsheetId?: string
): Promise<GoogleSheetSyncInfo> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Google account not connected. Please connect with Google first.');
  }

  const { userName, loginId, transactions, creditCards, friendBorrowings, salaryConfig, currency } = payload;
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `Flux Ledger — ${userName} (@${loginId}) [${dateStr}]`;

  let spreadsheetId = existingSpreadsheetId;
  let spreadsheetUrl = '';

  // 1. Create spreadsheet if none provided or invalid
  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          { properties: { title: 'Overview Summary' } },
          { properties: { title: 'Transactions' } },
          { properties: { title: 'Credit Cards & Loans' } },
          { properties: { title: 'Friend Borrowings' } },
          { properties: { title: 'Monthly Salary Allocation' } },
        ],
      }),
    });

    if (!createRes.ok) {
      const errJson = await createRes.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Failed to create Google Spreadsheet (HTTP ${createRes.status})`);
    }

    const createdData = await createRes.json();
    spreadsheetId = createdData.spreadsheetId;
    spreadsheetUrl = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  } else {
    spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  }

  // 2. Prepare Tab Data
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const totalCcDebt = creditCards.reduce((acc, c) => acc + (c.amountBorrowed || 0), 0);
  const totalFriendDebt = friendBorrowings.reduce((acc, f) => acc + (f.amountBorrowed || 0), 0);

  // Overview Sheet
  const summaryValues = [
    ['FLUX PERSONAL FINANCE LEDGER & VAULT BACKUP'],
    ['User Display Name', userName],
    ['User Login ID', `@${loginId}`],
    ['Currency', `${currency.code} (${currency.symbol})`],
    ['Last Synchronized', new Date().toLocaleString()],
    [''],
    ['FINANCIAL HEALTH SUMMARY', 'AMOUNT'],
    ['Total Recorded Income', `${currency.symbol}${totalIncome.toLocaleString()}`],
    ['Total Recorded Expenses', `${currency.symbol}${totalExpenses.toLocaleString()}`],
    ['Net Vault Cash Balance', `${currency.symbol}${netBalance.toLocaleString()}`],
    ['Credit Card Liabilities', `${currency.symbol}${totalCcDebt.toLocaleString()}`],
    ['Friend Borrowing Liabilities', `${currency.symbol}${totalFriendDebt.toLocaleString()}`],
    ['Total Combined Debt', `${currency.symbol}${(totalCcDebt + totalFriendDebt).toLocaleString()}`],
    ['Configured Monthly Salary', `${currency.symbol}${salaryConfig.amount.toLocaleString()}`],
    [''],
    ['Total Logged Transactions', transactions.length.toString()],
    ['Active Credit Cards', creditCards.length.toString()],
    ['Friend Borrowing Records', friendBorrowings.length.toString()],
  ];

  // Transactions Sheet
  const txValues = [
    ['ID', 'Date', 'Type', 'Category', 'Amount', 'Currency', 'Account / Method', 'Notes & Purpose'],
    ...transactions.map((t) => [
      t.id.toString(),
      t.date,
      t.type.toUpperCase(),
      t.category,
      t.amount.toString(),
      currency.code,
      t.account || 'Default Account',
      t.note || '',
    ]),
  ];

  // Credit Cards Sheet
  const ccValues = [
    ['Card / Account Name', 'Bank / Issuer', 'Current Balance Owed', 'Credit Limit', 'Billing Due Date', 'APR %', 'Notes'],
    ...creditCards.map((c) => [
      c.cardName,
      c.bankOrIssuer,
      c.amountBorrowed.toString(),
      (c.creditLimit || 0).toString(),
      c.billingDueDate || 'N/A',
      (c.apr || 0).toString(),
      c.notes || '',
    ]),
  ];

  // Friend Borrowings Sheet
  const friendValues = [
    ['Friend / Lender Name', 'Remaining Balance Owed', 'Original Borrowed', 'Borrowed Date', 'Due Date', 'Status', 'Contact', 'Notes'],
    ...friendBorrowings.map((f) => [
      f.friendName,
      f.amountBorrowed.toString(),
      f.originalAmount.toString(),
      f.borrowedDate,
      f.expectedPaybackDate || 'N/A',
      f.status.toUpperCase(),
      f.phoneOrContact || '',
      f.notes || '',
    ]),
  ];

  // Salary Allocation Sheet
  const salaryValues = [
    ['Allocation Category', 'Target Percentage %', 'Allocated Amount', 'Category Rule Match', 'Notes'],
    ...salaryConfig.sections.map((s) => [
      s.name,
      `${s.percentage}%`,
      s.amount.toString(),
      s.categoryMatching || 'All Categories',
      s.notes || '',
    ]),
  ];

  // 3. Batch Update Sheet Values
  const batchData = [
    {
      range: "'Overview Summary'!A1",
      values: summaryValues,
    },
    {
      range: "'Transactions'!A1",
      values: txValues,
    },
    {
      range: "'Credit Cards & Loans'!A1",
      values: ccValues,
    },
    {
      range: "'Friend Borrowings'!A1",
      values: friendValues,
    },
    {
      range: "'Monthly Salary Allocation'!A1",
      values: salaryValues,
    },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    }
  );

  if (!updateRes.ok) {
    // If specific sheet names don't exist yet in an existing spreadsheet, try writing to first sheet
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            ...summaryValues,
            [''],
            ['--- TRANSACTIONS ---'],
            ...txValues,
          ],
        }),
      }
    );

    if (!fallbackRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to populate Google Sheet (HTTP ${updateRes.status})`);
    }
  }

  return {
    spreadsheetId: spreadsheetId!,
    spreadsheetUrl,
    spreadsheetTitle: title,
    lastSyncedAt: new Date().toISOString(),
  };
}
