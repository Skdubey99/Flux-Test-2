import { UserProfile, UserSession, UserVaultData, Transaction, CreditCardBorrowing, FriendBorrowing, TodoItem, SalaryConfig, CurrencyConfig, UIColorId, HeaderStyleId } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/defaultTransactions';
import { INITIAL_CREDIT_CARDS, INITIAL_FRIEND_BORROWINGS } from '../data/defaultBorrowings';
import { INITIAL_TODOS } from '../data/defaultTodos';
import { INITIAL_SALARY_CONFIG } from '../data/defaultSalary';
import { DEFAULT_CURRENCY } from '../utils/currencies';

const USERS_REGISTRY_KEY = 'flux_users_registry';
const ACTIVE_SESSION_KEY = 'flux_active_session';
const USER_VAULT_PREFIX = 'flux_user_vault_';

// Hashing helper using Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sample distinct data for secondary demo user Sarah
const SARAH_TRANSACTIONS: Transaction[] = [
  {
    id: 's-1',
    type: 'income',
    amount: 5400,
    category: 'Consulting Retainer',
    note: 'Q3 Enterprise Architecture Retainer',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    account: 'Business Checking',
  },
  {
    id: 's-2',
    type: 'income',
    amount: 1850,
    category: 'Workshop Honorarium',
    note: 'Cloud Strategy Keynote',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    account: 'Direct Deposit',
  },
  {
    id: 's-3',
    type: 'expense',
    amount: 420,
    category: 'Software Subscriptions',
    note: 'Cloud Server Infrastructure & Figma',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    account: 'Corporate Amex',
  },
  {
    id: 's-4',
    type: 'expense',
    amount: 310,
    category: 'Client Dinner',
    note: 'Quarterly review with Tech Lead',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    account: 'Corporate Amex',
  },
];

const SARAH_CREDIT_CARDS: CreditCardBorrowing[] = [
  {
    id: 's-cc-1',
    cardName: 'Corporate Platinum',
    bankOrIssuer: 'Amex Business',
    amountBorrowed: 1240,
    creditLimit: 15000,
    billingDueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    apr: 18.24,
    notes: 'Auto-paid monthly from business checking',
    lastUpdated: new Date().toISOString(),
  },
];

const SARAH_FRIEND_BORROWINGS: FriendBorrowing[] = [];

const SARAH_TODOS: TodoItem[] = [
  {
    id: 's-td-1',
    title: 'Submit quarterly estimated business taxes',
    description: 'Reconcile 1099 invoices with CPA',
    completed: false,
    priority: 'high',
    category: 'financial',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    amount: 2200,
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-td-2',
    title: 'Audit annual SaaS tool subscriptions',
    description: 'Cancel unused software seats',
    completed: true,
    priority: 'medium',
    category: 'bills',
    createdAt: new Date().toISOString(),
  },
];

const SARAH_SALARY_CONFIG: SalaryConfig = {
  amount: 7250,
  frequency: 'monthly',
  title: 'Consulting Net Draws',
  payday: '15th of the month',
  lastUpdated: new Date().toISOString(),
  sections: [
    { id: 's-sec-1', name: 'Tax Reserve', percentage: 30, amount: 2175, color: '#f59e0b' },
    { id: 's-sec-2', name: 'Business Reinvestment', percentage: 25, amount: 1812.5, color: '#10b981' },
    { id: 's-sec-3', name: 'Owner Personal Draw', percentage: 35, amount: 2537.5, color: '#06b6d4' },
    { id: 's-sec-4', name: 'Emergency Runway', percentage: 10, amount: 725, color: '#8b5cf6' },
  ],
};

// Seed default users if none exist, or upgrade existing registry
export async function ensureDefaultUsersInitialized(): Promise<UserProfile[]> {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let modified = false;
        const hasAdmin = parsed.some((u: any) => u.loginId === 'admin' || u.role === 'admin');
        const upgraded: UserProfile[] = parsed.map((u: any) => {
          const uCopy = { ...u };
          if (!uCopy.role) {
            uCopy.role = (uCopy.loginId === 'admin' ? 'admin' : 'user');
            modified = true;
          }
          if (!uCopy.status) {
            uCopy.status = 'active';
            modified = true;
          }
          return uCopy;
        });

        if (!hasAdmin) {
          const adminSalt = generateSalt();
          const adminHash = await hashPassword('admin123', adminSalt);
          const masterAdminProfile: UserProfile = {
            id: 'usr_master',
            loginId: 'admin',
            name: 'Master Administrator',
            avatarColor: '#4338ca',
            role: 'admin',
            status: 'active',
            email: 'surajdubey033@gmail.com',
            notes: 'Primary Master Access account with full control over user ID provisioning and vault audits.',
            passwordHash: adminHash,
            salt: adminSalt,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            vaultVersion: 1,
          };
          upgraded.unshift(masterAdminProfile);

          // Seed admin vault if empty
          if (!localStorage.getItem(`${USER_VAULT_PREFIX}admin`)) {
            const masterVault: UserVaultData = {
              transactions: INITIAL_TRANSACTIONS,
              creditCards: INITIAL_CREDIT_CARDS,
              friendBorrowings: INITIAL_FRIEND_BORROWINGS,
              todos: INITIAL_TODOS,
              salaryConfig: INITIAL_SALARY_CONFIG,
              currency: DEFAULT_CURRENCY,
              uiColor: 'indigo',
              headerStyle: 'pure-light',
              theme: 'light',
            };
            localStorage.setItem(`${USER_VAULT_PREFIX}admin`, JSON.stringify(masterVault));
          }
          modified = true;
        }

        if (modified) {
          localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(upgraded));
        }
        return upgraded;
      }
    }

    // Initialize default seed profiles with Master Admin
    const adminSalt = generateSalt();
    const adminHash = await hashPassword('admin123', adminSalt);

    const alexSalt = generateSalt();
    const alexHash = await hashPassword('password123', alexSalt);

    const sarahSalt = generateSalt();
    const sarahHash = await hashPassword('password123', sarahSalt);

    const defaultUsers: UserProfile[] = [
      {
        id: 'usr_master',
        loginId: 'admin',
        name: 'Master Administrator',
        avatarColor: '#4338ca',
        role: 'admin',
        status: 'active',
        email: 'surajdubey033@gmail.com',
        notes: 'Primary Master Access account with full control over user ID provisioning and vault audits.',
        passwordHash: adminHash,
        salt: adminSalt,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        lastLoginAt: new Date().toISOString(),
        vaultVersion: 1,
      },
      {
        id: 'usr_alex',
        loginId: 'alex_finance',
        name: 'Alex Rivera',
        avatarColor: '#4f46e5',
        role: 'user',
        status: 'active',
        notes: 'Personal finance and tech salary tracking account.',
        passwordHash: alexHash,
        salt: alexSalt,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        lastLoginAt: new Date().toISOString(),
        vaultVersion: 1,
      },
      {
        id: 'usr_sarah',
        loginId: 'sarah_consulting',
        name: 'Sarah Chen',
        avatarColor: '#059669',
        role: 'user',
        status: 'active',
        notes: 'Freelance architecture and consulting ledger account.',
        passwordHash: sarahHash,
        salt: sarahSalt,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        lastLoginAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        vaultVersion: 1,
      },
    ];

    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(defaultUsers));

    // Seed Master Admin's vault with consolidated sample
    const masterVault: UserVaultData = {
      transactions: INITIAL_TRANSACTIONS,
      creditCards: INITIAL_CREDIT_CARDS,
      friendBorrowings: INITIAL_FRIEND_BORROWINGS,
      todos: INITIAL_TODOS,
      salaryConfig: INITIAL_SALARY_CONFIG,
      currency: DEFAULT_CURRENCY,
      uiColor: 'indigo',
      headerStyle: 'pure-light',
      theme: 'light',
    };
    localStorage.setItem(`${USER_VAULT_PREFIX}admin`, JSON.stringify(masterVault));

    // Seed Alex's isolated vault
    // If legacy localStorage data exists, migrate it to Alex's vault; otherwise use defaults
    let alexTransactions = INITIAL_TRANSACTIONS;
    let alexCreditCards = INITIAL_CREDIT_CARDS;
    let alexFriends = INITIAL_FRIEND_BORROWINGS;
    let alexTodos = INITIAL_TODOS;
    let alexSalary = INITIAL_SALARY_CONFIG;
    let alexCurrency = DEFAULT_CURRENCY;
    let alexUiColor: UIColorId = 'indigo';
    let alexHeaderStyle: HeaderStyleId = 'pure-light';
    let alexTheme: 'dark' | 'light' = 'light';

    try {
      const legacyTx = localStorage.getItem('flux_data');
      if (legacyTx) alexTransactions = JSON.parse(legacyTx);
      const legacyCc = localStorage.getItem('flux_credit_cards');
      if (legacyCc) alexCreditCards = JSON.parse(legacyCc);
      const legacyFr = localStorage.getItem('flux_friend_borrowings');
      if (legacyFr) alexFriends = JSON.parse(legacyFr);
      const legacyTd = localStorage.getItem('flux_todos');
      if (legacyTd) alexTodos = JSON.parse(legacyTd);
      const legacySal = localStorage.getItem('flux_salary_config');
      if (legacySal) alexSalary = JSON.parse(legacySal);
      const legacyColor = localStorage.getItem('flux_ui_color') as UIColorId;
      if (legacyColor) alexUiColor = legacyColor;
      const legacyHeader = localStorage.getItem('flux_header_style') as HeaderStyleId;
      if (legacyHeader) alexHeaderStyle = legacyHeader;
      const legacyTheme = localStorage.getItem('flux_theme') as 'dark' | 'light';
      if (legacyTheme) alexTheme = legacyTheme;
    } catch (e) {
      console.error('Error migrating legacy data to initial vault', e);
    }

    const alexVault: UserVaultData = {
      transactions: alexTransactions,
      creditCards: alexCreditCards,
      friendBorrowings: alexFriends,
      todos: alexTodos,
      salaryConfig: alexSalary,
      currency: alexCurrency,
      uiColor: alexUiColor,
      headerStyle: alexHeaderStyle,
      theme: alexTheme,
    };
    localStorage.setItem(`${USER_VAULT_PREFIX}alex_finance`, JSON.stringify(alexVault));

    // Seed Sarah's completely separate isolated vault
    const sarahVault: UserVaultData = {
      transactions: SARAH_TRANSACTIONS,
      creditCards: SARAH_CREDIT_CARDS,
      friendBorrowings: SARAH_FRIEND_BORROWINGS,
      todos: SARAH_TODOS,
      salaryConfig: SARAH_SALARY_CONFIG,
      currency: DEFAULT_CURRENCY,
      uiColor: 'emerald',
      headerStyle: 'soft-cloud',
      theme: 'light',
    };
    localStorage.setItem(`${USER_VAULT_PREFIX}sarah_consulting`, JSON.stringify(sarahVault));

    return defaultUsers;
  } catch (err) {
    console.error('Failed to initialize default users', err);
    return [];
  }
}

// Get all registered users
export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Get public profiles for user switcher
export function getPublicUserProfiles(): { loginId: string; name: string; avatarColor: string; lastLoginAt: string }[] {
  const users = getRegisteredUsers();
  return users.map((u) => ({
    loginId: u.loginId,
    name: u.name,
    avatarColor: u.avatarColor,
    lastLoginAt: u.lastLoginAt,
  }));
}

// Get current active session
export function getActiveSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Get current logged-in user profile
export function getActiveUser(): UserProfile | null {
  const session = getActiveSession();
  if (!session) return null;
  const users = getRegisteredUsers();
  return users.find((u) => u.loginId.toLowerCase() === session.loginId.toLowerCase()) || null;
}

// Load isolated vault data for a specific user
export function getUserVaultData(loginId: string): UserVaultData {
  const key = `${USER_VAULT_PREFIX}${loginId.toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        creditCards: Array.isArray(parsed.creditCards) ? parsed.creditCards : [],
        friendBorrowings: Array.isArray(parsed.friendBorrowings) ? parsed.friendBorrowings : [],
        todos: Array.isArray(parsed.todos) ? parsed.todos : [],
        salaryConfig: parsed.salaryConfig || INITIAL_SALARY_CONFIG,
        currency: parsed.currency || DEFAULT_CURRENCY,
        uiColor: parsed.uiColor || 'indigo',
        headerStyle: parsed.headerStyle || 'pure-light',
        theme: parsed.theme || 'light',
      };
    }
  } catch (e) {
    console.error(`Failed to load vault for ${loginId}`, e);
  }

  // Blank initial vault if none exists
  return {
    transactions: [],
    creditCards: [],
    friendBorrowings: [],
    todos: [],
    salaryConfig: {
      amount: 0,
      frequency: 'monthly',
      lastUpdated: new Date().toISOString(),
      sections: [],
    },
    currency: DEFAULT_CURRENCY,
    uiColor: 'indigo',
    headerStyle: 'pure-light',
    theme: 'light',
  };
}

// Save isolated vault data for a specific user
export function saveUserVaultData(loginId: string, data: Partial<UserVaultData>) {
  const current = getUserVaultData(loginId);
  const updated: UserVaultData = {
    ...current,
    ...data,
  };
  const key = `${USER_VAULT_PREFIX}${loginId.toLowerCase()}`;
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error(`Failed to save vault for ${loginId}`, e);
  }
}

// Login verification
export async function loginUser(
  loginIdInput: string,
  passwordInput: string
): Promise<{ user: UserProfile; vault: UserVaultData }> {
  const cleanId = loginIdInput.trim().toLowerCase();
  const users = getRegisteredUsers();
  const user = users.find((u) => u.loginId.toLowerCase() === cleanId);

  if (!user) {
    throw new Error(`Login ID "${cleanId}" was not found. Please check spelling or create a new vault account.`);
  }

  if (user.status === 'suspended') {
    throw new Error('This account has been suspended by the Master Administrator. Access denied.');
  }

  const computedHash = await hashPassword(passwordInput, user.salt);
  if (computedHash !== user.passwordHash) {
    throw new Error('Incorrect password or security PIN. Access denied to this private vault.');
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(updatedUsers));

  // Set active session
  const session: UserSession = {
    loginId: user.loginId,
    token: `flux_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

  const vault = getUserVaultData(user.loginId);
  return { user, vault };
}

// Register a brand-new user with private vault
export async function registerUser(
  loginIdInput: string,
  nameInput: string,
  passwordInput: string,
  avatarColorInput = '#4f46e5',
  seedWithTemplate = false
): Promise<{ user: UserProfile; vault: UserVaultData }> {
  const cleanId = loginIdInput.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const cleanName = nameInput.trim();

  if (!cleanId || cleanId.length < 3) {
    throw new Error('Login ID must be at least 3 alphanumeric characters (letters, numbers, underscores).');
  }

  if (!cleanName) {
    throw new Error('Please enter a display name for this account.');
  }

  if (!passwordInput || passwordInput.length < 4) {
    throw new Error('Password / PIN must be at least 4 characters long.');
  }

  const users = getRegisteredUsers();
  if (users.some((u) => u.loginId.toLowerCase() === cleanId)) {
    throw new Error(`The Login ID "${cleanId}" is already taken. Please choose another unique Login ID.`);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(passwordInput, salt);

  const newUser: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    loginId: cleanId,
    name: cleanName,
    avatarColor: avatarColorInput,
    role: 'user',
    status: 'active',
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    vaultVersion: 1,
  };

  users.push(newUser);
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));

  // Initialize new isolated vault
  const initialVault: UserVaultData = {
    transactions: seedWithTemplate ? INITIAL_TRANSACTIONS : [],
    creditCards: seedWithTemplate ? INITIAL_CREDIT_CARDS : [],
    friendBorrowings: [],
    todos: seedWithTemplate ? INITIAL_TODOS : [],
    salaryConfig: seedWithTemplate
      ? INITIAL_SALARY_CONFIG
      : {
          amount: 0,
          frequency: 'monthly',
          lastUpdated: new Date().toISOString(),
          sections: [],
        },
    currency: DEFAULT_CURRENCY,
    uiColor: 'indigo',
    headerStyle: 'pure-light',
    theme: 'light',
  };

  saveUserVaultData(cleanId, initialVault);

  // Set active session
  const session: UserSession = {
    loginId: cleanId,
    token: `flux_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

  return { user: newUser, vault: initialVault };
}

// Log out active user
export function logoutUser(): void {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

// Update password
export async function changeUserPassword(loginId: string, oldPass: string, newPass: string): Promise<boolean> {
  const users = getRegisteredUsers();
  const userIndex = users.findIndex((u) => u.loginId.toLowerCase() === loginId.toLowerCase());
  if (userIndex === -1) throw new Error('User not found.');

  const user = users[userIndex];
  const oldHash = await hashPassword(oldPass, user.salt);
  if (oldHash !== user.passwordHash) {
    throw new Error('Current password does not match.');
  }

  if (newPass.length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPass, newSalt);

  users[userIndex] = {
    ...user,
    salt: newSalt,
    passwordHash: newHash,
  };

  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  return true;
}

// Check if user has Master Administrator privileges
export function isMasterAdmin(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.loginId.toLowerCase() === 'admin';
}

// Master Admin: Create new user with custom specifications
export async function adminCreateUser(params: {
  loginId: string;
  name: string;
  password: string;
  role?: 'admin' | 'user';
  email?: string;
  notes?: string;
  avatarColor?: string;
  seedWithTemplate?: boolean;
}): Promise<UserProfile> {
  const cleanId = params.loginId.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const cleanName = params.name.trim();

  if (!cleanId || cleanId.length < 3) {
    throw new Error('Login ID must be at least 3 alphanumeric characters.');
  }
  if (!cleanName) {
    throw new Error('User display name is required.');
  }
  if (!params.password || params.password.length < 4) {
    throw new Error('Password / PIN must be at least 4 characters long.');
  }

  const users = getRegisteredUsers();
  if (users.some((u) => u.loginId.toLowerCase() === cleanId)) {
    throw new Error(`The Login ID "${cleanId}" is already taken.`);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(params.password, salt);

  const newUser: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    loginId: cleanId,
    name: cleanName,
    avatarColor: params.avatarColor || '#4f46e5',
    role: params.role || 'user',
    status: 'active',
    email: params.email?.trim(),
    notes: params.notes?.trim(),
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastLoginAt: 'Never',
    vaultVersion: 1,
  };

  users.push(newUser);
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));

  const initialVault: UserVaultData = {
    transactions: params.seedWithTemplate ? INITIAL_TRANSACTIONS : [],
    creditCards: params.seedWithTemplate ? INITIAL_CREDIT_CARDS : [],
    friendBorrowings: [],
    todos: params.seedWithTemplate ? INITIAL_TODOS : [],
    salaryConfig: params.seedWithTemplate
      ? INITIAL_SALARY_CONFIG
      : {
          amount: 0,
          frequency: 'monthly',
          lastUpdated: new Date().toISOString(),
          sections: [],
        },
    currency: DEFAULT_CURRENCY,
    uiColor: 'indigo',
    headerStyle: 'pure-light',
    theme: 'light',
  };

  saveUserVaultData(cleanId, initialVault);
  return newUser;
}

// Master Admin: Reset user password without needing old password
export async function adminResetUserPassword(targetLoginId: string, newPass: string): Promise<boolean> {
  if (!newPass || newPass.length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.loginId.toLowerCase() === targetLoginId.toLowerCase());
  if (idx === -1) throw new Error('Target user not found.');

  const user = users[idx];
  const newSalt = generateSalt();
  const newHash = await hashPassword(newPass, newSalt);

  users[idx] = {
    ...user,
    salt: newSalt,
    passwordHash: newHash,
  };

  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  return true;
}

// Master Admin: Toggle user active / suspended status
export function adminToggleUserStatus(targetLoginId: string): UserProfile {
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.loginId.toLowerCase() === targetLoginId.toLowerCase());
  if (idx === -1) throw new Error('Target user not found.');

  const user = users[idx];
  if (user.loginId.toLowerCase() === 'admin') {
    throw new Error('Primary Master Administrator account status cannot be suspended.');
  }

  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  users[idx] = {
    ...user,
    status: newStatus,
  };

  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  return users[idx];
}

// Master Admin: Update user role (admin vs user)
export function adminUpdateUserRole(targetLoginId: string, newRole: 'admin' | 'user'): UserProfile {
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.loginId.toLowerCase() === targetLoginId.toLowerCase());
  if (idx === -1) throw new Error('Target user not found.');

  const user = users[idx];
  if (user.loginId.toLowerCase() === 'admin' && newRole !== 'admin') {
    throw new Error('Primary Master Administrator role cannot be changed.');
  }

  users[idx] = {
    ...user,
    role: newRole,
  };

  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  return users[idx];
}

// Master Admin: Delete a user and wipe their private vault
export function adminDeleteUser(targetLoginId: string): boolean {
  const cleanId = targetLoginId.toLowerCase();
  if (cleanId === 'admin') {
    throw new Error('Master Administrator account cannot be deleted.');
  }

  const users = getRegisteredUsers();
  const filtered = users.filter((u) => u.loginId.toLowerCase() !== cleanId);
  if (filtered.length === users.length) throw new Error('User not found.');

  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(filtered));

  // Wipe isolated vault storage for deleted user
  localStorage.removeItem(`${USER_VAULT_PREFIX}${cleanId}`);
  return true;
}

// Master Admin: Inspect vault statistics for any user
export function adminGetUserStats(loginId: string) {
  const vault = getUserVaultData(loginId);
  const tx = vault.transactions || [];
  const cc = vault.creditCards || [];
  const fr = vault.friendBorrowings || [];
  const income = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const ccDebt = cc.reduce((s, c) => s + (c.amountBorrowed || 0), 0);
  const frDebt = fr.reduce((s, f) => s + (f.amountBorrowed || 0), 0);

  return {
    transactionCount: tx.length,
    incomeTotal: income,
    expenseTotal: expense,
    netBalance: income - expense,
    creditCardCount: cc.length,
    totalDebt: ccDebt + frDebt,
    todoCount: (vault.todos || []).length,
    salaryAmount: vault.salaryConfig?.amount || 0,
    googleSheetSync: vault.googleSheetSync,
  };
}
