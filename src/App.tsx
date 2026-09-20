import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  ViewMode,
  CurrencyConfig,
  CreditCardBorrowing,
  FriendBorrowing,
  TodoItem,
  SalaryConfig,
  UIColorId,
  HeaderStyleId,
  UserProfile,
  UserVaultData,
  GoogleSheetSyncInfo,
} from './types';
import { INITIAL_TRANSACTIONS } from './data/defaultTransactions';
import { INITIAL_CREDIT_CARDS, INITIAL_FRIEND_BORROWINGS } from './data/defaultBorrowings';
import { INITIAL_TODOS } from './data/defaultTodos';
import { INITIAL_SALARY_CONFIG } from './data/defaultSalary';
import { CURRENCIES, DEFAULT_CURRENCY, formatCurrency } from './utils/currencies';
import { getUIColorTheme, applyThemeVariables, getHeaderStyleClasses } from './utils/themeColors';
import {
  ensureDefaultUsersInitialized,
  getActiveUser,
  getUserVaultData,
  saveUserVaultData,
  logoutUser,
} from './services/authService';
import { syncVaultToFirestore, logoutFirebase } from './services/firebaseAuthService';
import { VaultAuthScreen } from './components/VaultAuthScreen';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { CashFlowChart } from './components/CashFlowChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { TransactionRow } from './components/TransactionRow';
import { TransactionModal } from './components/TransactionModal';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { BorrowingsView } from './components/BorrowingsView';
import { DashboardBorrowingsWidget } from './components/DashboardBorrowingsWidget';
import { UpdateCreditCardModal } from './components/UpdateCreditCardModal';
import { UpdateFriendBorrowingModal } from './components/UpdateFriendBorrowingModal';
import { TodosView } from './components/TodosView';
import { DashboardTodosWidget } from './components/DashboardTodosWidget';
import { TodoModal } from './components/TodoModal';
import { SalaryAllocationView } from './components/SalaryAllocationView';
import { DashboardSalaryWidget } from './components/DashboardSalaryWidget';
import { ThemeColorModal } from './components/ThemeColorModal';
import { MasterUserManagement } from './components/MasterUserManagement';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  Sun,
  Moon,
  Zap,
  Scale,
  Sparkles,
  Activity,
  HandCoins,
  CheckSquare,
  Palette,
  Lock,
  User,
  Users,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [uiColor, setUiColor] = useState<UIColorId>('blue');
  const [headerStyle, setHeaderStyle] = useState<HeaderStyleId>('pure-light');
  const [currency, setCurrency] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [creditCards, setCreditCards] = useState<CreditCardBorrowing[]>(INITIAL_CREDIT_CARDS);
  const [friendBorrowings, setFriendBorrowings] = useState<FriendBorrowing[]>(INITIAL_FRIEND_BORROWINGS);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig>(INITIAL_SALARY_CONFIG);

  // Authentication & Vault Isolation State
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [lastActiveLoginId, setLastActiveLoginId] = useState<string>('');
  const [googleSheetSync, setGoogleSheetSync] = useState<GoogleSheetSyncInfo | undefined>(undefined);

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const activeColorTheme = useMemo(() => getUIColorTheme(uiColor), [uiColor]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Borrowing Modals
  const [creditCardModalOpen, setCreditCardModalOpen] = useState(false);
  const [editingCreditCard, setEditingCreditCard] = useState<CreditCardBorrowing | null>(null);

  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [editingFriendBorrowing, setEditingFriendBorrowing] = useState<FriendBorrowing | null>(null);

  // Todo Modal
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const applyVaultData = (vault: UserVaultData) => {
    setTransactions(vault.transactions || []);
    setCreditCards(vault.creditCards || []);
    setFriendBorrowings(vault.friendBorrowings || []);
    setTodos(vault.todos || []);
    setSalaryConfig(vault.salaryConfig || INITIAL_SALARY_CONFIG);
    setCurrency(vault.currency || DEFAULT_CURRENCY);
    setUiColor(vault.uiColor || 'indigo');
    setHeaderStyle(vault.headerStyle || 'pure-light');
    setTheme(vault.theme || 'light');
    setGoogleSheetSync(vault.googleSheetSync);
  };

  // Initialize auth & check active user session
  useEffect(() => {
    async function bootAuth() {
      await ensureDefaultUsersInitialized();
      const active = getActiveUser();
      if (active) {
        setCurrentUser(active);
        setLastActiveLoginId(active.loginId);
        const vault = getUserVaultData(active.loginId);
        applyVaultData(vault);
      } else {
        setCurrentUser(null);
      }
      setAuthInitialized(true);
    }
    bootAuth();
  }, []);

  // Sync state into active user's private isolated vault
  useEffect(() => {
    if (!currentUser || !authInitialized) return;
    const currentVault: UserVaultData = {
      transactions,
      creditCards,
      friendBorrowings,
      todos,
      salaryConfig,
      currency,
      uiColor,
      headerStyle,
      theme,
      googleSheetSync,
    };
    saveUserVaultData(currentUser.loginId, currentVault);

    // If authenticated through Firebase or has Firebase link, asynchronously sync to Firestore
    if (currentUser.authProvider === 'firebase_google' || currentUser.firebaseUid) {
      syncVaultToFirestore(currentUser, currentVault).catch((e) => {
        console.warn('Firestore background auto-sync:', e);
      });
    }
  }, [
    currentUser,
    authInitialized,
    transactions,
    creditCards,
    friendBorrowings,
    todos,
    salaryConfig,
    currency,
    uiColor,
    headerStyle,
    theme,
    googleSheetSync,
  ]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync UI Accent Color and apply dynamic CSS variables
  useEffect(() => {
    applyThemeVariables(uiColor, theme === 'dark');
  }, [uiColor, theme]);

  // Sync currency
  const handleCurrencyChange = (newCurr: CurrencyConfig) => {
    setCurrency(newCurr);
  };

  const handleAuthenticated = (user: UserProfile, vault: UserVaultData) => {
    setCurrentUser(user);
    setLastActiveLoginId(user.loginId);
    applyVaultData(vault);
  };

  const handleSwitchUserSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setLastActiveLoginId(user.loginId);
    const vault = getUserVaultData(user.loginId);
    applyVaultData(vault);
  };

  const handleLockVault = () => {
    if (currentUser) {
      setLastActiveLoginId(currentUser.loginId);
    }
    setCurrentUser(null);
  };

  const handleSignOut = () => {
    logoutFirebase().catch(() => {});
    logoutUser();
    if (currentUser) {
      setLastActiveLoginId(currentUser.loginId);
    }
    setCurrentUser(null);
  };

  // Keyboard shortcut: Press 'N' to open New Entry modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTransaction(null);
        setModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute key stats
  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

    return {
      income,
      expense,
      balance,
      savingsRate,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  // Borrowing Handlers
  const handleSaveCreditCard = (card: CreditCardBorrowing) => {
    setCreditCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) {
        return prev.map((c) => (c.id === card.id ? card : c));
      }
      return [card, ...prev];
    });
    setCreditCardModalOpen(false);
    setEditingCreditCard(null);
  };

  const handleDeleteCreditCard = (id: string | number) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
    setCreditCardModalOpen(false);
    setEditingCreditCard(null);
  };

  const handleSaveFriendBorrowing = (borrowing: FriendBorrowing) => {
    setFriendBorrowings((prev) => {
      const exists = prev.some((f) => f.id === borrowing.id);
      if (exists) {
        return prev.map((f) => (f.id === borrowing.id ? borrowing : f));
      }
      return [borrowing, ...prev];
    });
    setFriendModalOpen(false);
    setEditingFriendBorrowing(null);
  };

  const handleDeleteFriendBorrowing = (id: string | number) => {
    setFriendBorrowings((prev) => prev.filter((f) => f.id !== id));
    setFriendModalOpen(false);
    setEditingFriendBorrowing(null);
  };

  const handleOpenAddCreditCard = () => {
    setEditingCreditCard(null);
    setCreditCardModalOpen(true);
  };

  const handleOpenEditCreditCard = (card?: CreditCardBorrowing) => {
    setEditingCreditCard(card || null);
    setCreditCardModalOpen(true);
  };

  const handleOpenAddFriendBorrowing = () => {
    setEditingFriendBorrowing(null);
    setFriendModalOpen(true);
  };

  const handleOpenEditFriendBorrowing = (borrowing?: FriendBorrowing) => {
    setEditingFriendBorrowing(borrowing || null);
    setFriendModalOpen(true);
  };

  // To-Do Handlers
  const handleSaveTodo = (todoItem: TodoItem) => {
    setTodos((prev) => {
      const exists = prev.some((t) => t.id === todoItem.id);
      if (exists) {
        return prev.map((t) => (t.id === todoItem.id ? todoItem : t));
      }
      return [todoItem, ...prev];
    });
    setTodoModalOpen(false);
    setEditingTodo(null);
  };

  const handleToggleTodo = (id: string | number) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          const today = new Date().toISOString().split('T')[0];
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? (t.completedAt || today) : undefined,
            updatedAt: today,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTodo = (id: string | number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setTodoModalOpen(false);
    setEditingTodo(null);
  };

  const handleOpenAddTodo = () => {
    setEditingTodo(null);
    setTodoModalOpen(true);
  };

  const handleOpenEditTodo = (todoItem: TodoItem) => {
    setEditingTodo(todoItem);
    setTodoModalOpen(true);
  };

  const pendingTodosCount = useMemo(() => {
    return todos.filter((t) => !t.completed).length;
  }, [todos]);

  const borrowingsCount = useMemo(() => {
    return (
      creditCards.filter((c) => c.amountBorrowed > 0).length +
      friendBorrowings.filter((f) => f.amountBorrowed > 0).length
    );
  }, [creditCards, friendBorrowings]);

  // Handlers
  const handleSaveTransaction = (txn: Omit<Transaction, 'id'> & { id?: string | number }) => {
    if (txn.id !== undefined) {
      setTransactions((prev) =>
        prev.map((curr) => (curr.id === txn.id ? (txn as Transaction) : curr))
      );
    } else {
      const newEntry: Transaction = {
        ...txn,
        id: Date.now(),
      };
      setTransactions((prev) => [newEntry, ...prev]);
    }
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string | number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDepositSalary = (txn: Omit<Transaction, 'id'>) => {
    const newTxn: Transaction = {
      ...txn,
      id: Date.now(),
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t);
    setModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const isDark = theme === 'dark';

  // Enforce zero-trust auth guard if not authenticated
  if (authInitialized && !currentUser) {
    return (
      <VaultAuthScreen
        onAuthenticated={handleAuthenticated}
        theme={theme}
        currentActiveLoginId={lastActiveLoginId}
      />
    );
  }

  return (
    <div
      className={`flex min-h-screen antialiased font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar
          view={view}
          onViewChange={setView}
          theme={theme}
          onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
          onOpenNewTransaction={handleOpenNew}
          balance={stats.balance}
          currency={currency}
          transactionCount={stats.transactionCount}
          borrowingsCount={borrowingsCount}
          todosCount={pendingTodosCount}
          salaryConfigured={salaryConfig.amount > 0}
          uiColorTheme={activeColorTheme}
          onOpenColorModal={() => setColorModalOpen(true)}
          currentUser={currentUser}
          onOpenAccountModal={() => setAccountModalOpen(true)}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-12">
        {/* Top Header Bar - With customizable lightness and luminosity */}
        <header
          className={`sticky top-0 z-20 px-4 sm:px-8 py-3.5 backdrop-blur-md flex items-center justify-between transition-colors duration-200 ${getHeaderStyleClasses(
            headerStyle,
            isDark
          )}`}
        >
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-colors"
                style={{
                  backgroundColor: isDark ? activeColorTheme.darkHex : activeColorTheme.hex,
                }}
              >
                <Scale size={16} strokeWidth={2.2} />
              </div>
              <span className={`font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Balance Ledger
              </span>
            </div>

            <div className="hidden md:block">
              <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {view === 'dashboard' && 'Financial Dashboard'}
                {view === 'transactions' && 'General Ledger'}
                {view === 'borrowings' && 'Liabilities & Outstanding Debt'}
                {view === 'todos' && 'Financial Action Items & Deadlines'}
                {view === 'salary' && 'Compensation & Budget Allocation'}
                {view === 'analytics' && 'Financial Statements & Analytics'}
                {view === 'settings' && 'System Configuration & Security'}
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {view === 'dashboard' && 'Real-time financial status, liquidity metrics, and liability overview'}
                {view === 'transactions' && 'Double-entry inspired chronological accounting ledger'}
                {view === 'borrowings' && 'Credit card balances, revolving credit, and peer debt obligations'}
                {view === 'todos' && 'Scheduled billings, loan amortizations, and urgent financial tasks'}
                {view === 'salary' && 'Salary distribution rules, planned allocations, and variance tracking'}
                {view === 'analytics' && 'Cash velocity breakdown, savings rate, and expense distributions'}
                {view === 'settings' && 'Zero-trust vault controls, external synchronization, and profile settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Balance Badge on Mobile Header */}
            <div className="md:hidden text-right mr-1">
              <span className={`text-[10px] uppercase font-mono block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Balance
              </span>
              <span
                className={`text-xs font-bold font-mono-numbers ${
                  stats.balance >= 0
                    ? isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-600'
                    : isDark
                    ? 'text-rose-400'
                    : 'text-rose-600'
                }`}
              >
                {formatCurrency(stats.balance, currency)}
              </span>
            </div>

            {/* Quick Add Button in Header */}
            <button
              id="header-new-entry-btn"
              onClick={handleOpenNew}
              style={{
                backgroundColor: isDark ? activeColorTheme.darkHex : activeColorTheme.hex,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Entry</span>
            </button>

            {/* UI Color Palette Customization Button */}
            <button
              id="header-theme-palette-btn"
              onClick={() => setColorModalOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Customize UI Color & Header Luminosity"
            >
              <Palette
                size={17}
                style={{ color: isDark ? activeColorTheme.darkHex : activeColorTheme.hex }}
              />
            </button>

            {/* Theme toggle */}
            <button
              id="header-theme-toggle"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Google Sheets Sync shortcut button - Master Admin Only */}
            {currentUser && (currentUser.role === 'admin' || currentUser.loginId === 'admin') && (
              <button
                id="header-google-sheets-btn"
                onClick={() => setView('settings')}
                className={`p-2 rounded-lg transition-colors relative ${
                  googleSheetSync
                    ? 'text-emerald-500 hover:bg-emerald-500/10'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={googleSheetSync ? `Google Sheets Linked: ${googleSheetSync.spreadsheetTitle}` : 'Connect Google Drive & Sheets'}
              >
                <FileSpreadsheet size={17} />
                {googleSheetSync && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            )}

            {/* Master Access Quick Button for Admin */}
            {(currentUser?.role === 'admin' || currentUser?.loginId === 'admin') && (
              <button
                id="header-master-access-btn"
                onClick={() => setView('users')}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  view === 'users'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isDark
                    ? 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
                title="Master User Administration & Access Control"
              >
                <ShieldCheck size={14} />
                <span>Master Access</span>
              </button>
            )}

            {/* Quick Lock Vault Button */}
            <button
              id="header-lock-vault-btn"
              onClick={handleLockVault}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/80'
                  : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
              }`}
              title="Lock Private Vault"
            >
              <Lock size={17} />
            </button>

            {/* Active User Account Switcher Badge */}
            {currentUser && (
              <button
                id="header-user-account-btn"
                onClick={() => setAccountModalOpen(true)}
                className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:bg-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-xs'
                }`}
                title="Account Vault & Switcher"
              >
                <div
                  className="w-6 h-6 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: currentUser.avatarColor || '#4f46e5' }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block leading-none">
                  <span className="text-xs font-bold block">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                    @{currentUser.loginId}
                  </span>
                </div>
                <Users size={13} className="text-slate-400 ml-0.5 hidden sm:inline" />
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Balance Card */}
                <div
                  className={`card rounded-xl p-5 relative overflow-hidden group transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700'
                      : 'bg-white border border-slate-200/90 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">Total Balance</span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        isDark
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      }`}
                    >
                      <Wallet size={15} />
                    </div>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-bold font-mono-numbers tracking-tight ${
                      stats.balance >= 0
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600'
                        : isDark
                        ? 'text-rose-400'
                        : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(stats.balance, currency)}
                  </div>
                  <div
                    className={`flex items-center justify-between text-[11px] mt-3 pt-3 border-t ${
                      isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Activity size={12} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                      Net Capital
                    </span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      {stats.savingsRate.toFixed(0)}% Savings Rate
                    </span>
                  </div>
                </div>

                {/* Inflow Card */}
                <div
                  className={`card rounded-xl p-5 relative overflow-hidden group transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm hover:border-emerald-500/40'
                      : 'bg-white border border-slate-200/90 shadow-sm hover:border-emerald-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">Total Inflow</span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        isDark
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      }`}
                    >
                      <TrendingUp size={15} />
                    </div>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-bold font-mono-numbers tracking-tight ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  >
                    +{formatCurrency(stats.income, currency)}
                  </div>
                  <div
                    className={`flex items-center justify-between text-[11px] mt-3 pt-3 border-t ${
                      isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
                    }`}
                  >
                    <span>Active Revenue</span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {transactions.filter((t) => t.type === 'income').length} Credits
                    </span>
                  </div>
                </div>

                {/* Outflow Card */}
                <div
                  className={`card rounded-xl p-5 relative overflow-hidden group transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm hover:border-rose-500/40'
                      : 'bg-white border border-slate-200/90 shadow-sm hover:border-rose-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="uppercase font-semibold tracking-wider text-[11px]">Total Outflow</span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        isDark
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : 'bg-rose-50 border-rose-200 text-rose-600'
                      }`}
                    >
                      <TrendingDown size={15} />
                    </div>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-bold font-mono-numbers tracking-tight ${
                      isDark ? 'text-rose-400' : 'text-rose-600'
                    }`}
                  >
                    -{formatCurrency(stats.expense, currency)}
                  </div>
                  <div
                    className={`flex items-center justify-between text-[11px] mt-3 pt-3 border-t ${
                      isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
                    }`}
                  >
                    <span>Operating Expenses</span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                      {transactions.filter((t) => t.type === 'expense').length} Debits
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Component */}
              <CashFlowChart transactions={transactions} currency={currency} theme={theme} />

              {/* Dedicated Salary & Budget Allocation Widget on Dashboard */}
              <DashboardSalaryWidget
                salaryConfig={salaryConfig}
                currency={currency}
                onNavigateToSalary={() => setView('salary')}
                theme={theme}
              />

              {/* Dedicated Borrowings & Liabilities Section on Dashboard */}
              <DashboardBorrowingsWidget
                creditCards={creditCards}
                friendBorrowings={friendBorrowings}
                currency={currency}
                onNavigateToBorrowings={() => setView('borrowings')}
                onOpenCreditCardModal={(card) => {
                  setEditingCreditCard(card || null);
                  setCreditCardModalOpen(true);
                }}
                onOpenFriendModal={(borrowing) => {
                  setEditingFriendBorrowing(borrowing || null);
                  setFriendModalOpen(true);
                }}
                theme={theme}
              />

              {/* Dedicated Financial & Personal To-Do Widget on Dashboard */}
              <DashboardTodosWidget
                todos={todos}
                currency={currency}
                onNavigateToTodos={() => setView('todos')}
                onToggleTodo={handleToggleTodo}
                onOpenEditModal={handleOpenEditTodo}
                onOpenAddModal={handleOpenAddTodo}
                theme={theme}
              />

              {/* Two Column Grid: Category Allocation & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Allocation */}
                <div className="lg:col-span-1">
                  <CategoryBreakdown transactions={transactions} currency={currency} theme={theme} />
                </div>

                {/* Recent Transactions List */}
                <div
                  className={`lg:col-span-2 card rounded-xl p-5 flex flex-col justify-between transition-colors duration-200 ${
                    isDark
                      ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
                      : 'bg-white border border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          Recent Activities
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Latest recorded transactions
                        </p>
                      </div>
                      <button
                        id="view-all-txns-btn"
                        onClick={() => setView('transactions')}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                          isDark
                            ? 'text-indigo-400 hover:text-indigo-300'
                            : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        View All ({transactions.length})
                        <ArrowUpRight size={13} />
                      </button>
                    </div>

                    <div
                      className={`divide-y ${
                        isDark ? 'divide-slate-800/60' : 'divide-slate-100'
                      }`}
                    >
                      {transactions.length === 0 ? (
                        <p className={`text-center text-xs py-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          No transactions recorded yet. Click "New Entry" to get started.
                        </p>
                      ) : (
                        transactions.slice(0, 5).map((t) => (
                          <TransactionRow
                            key={t.id}
                            transaction={t}
                            currency={currency}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteTransaction}
                            compact
                            theme={theme}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {transactions.length > 5 && (
                    <div
                      className={`pt-3 mt-3 border-t text-center ${
                        isDark ? 'border-slate-800/80' : 'border-slate-100'
                      }`}
                    >
                      <button
                        onClick={() => setView('transactions')}
                        className={`text-xs font-semibold transition-colors ${
                          isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        + {transactions.length - 5} older transactions in ledger
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS VIEW */}
          {view === 'transactions' && (
            <div className="animate-fadeIn">
              <TransactionsView
                transactions={transactions}
                currency={currency}
                onEdit={handleEditClick}
                onDelete={handleDeleteTransaction}
                onOpenNew={handleOpenNew}
                theme={theme}
              />
            </div>
          )}

          {/* BORROWINGS & LIABILITIES VIEW */}
          {view === 'borrowings' && (
            <div className="animate-fadeIn">
              <BorrowingsView
                creditCards={creditCards}
                friendBorrowings={friendBorrowings}
                currency={currency}
                onUpdateCreditCard={handleSaveCreditCard}
                onDeleteCreditCard={handleDeleteCreditCard}
                onOpenAddCreditCard={handleOpenAddCreditCard}
                onOpenEditCreditCard={handleOpenEditCreditCard}
                onUpdateFriendBorrowing={handleSaveFriendBorrowing}
                onDeleteFriendBorrowing={handleDeleteFriendBorrowing}
                onOpenAddFriendBorrowing={handleOpenAddFriendBorrowing}
                onOpenEditFriendBorrowing={handleOpenEditFriendBorrowing}
                theme={theme}
              />
            </div>
          )}

          {/* TO-DO & ACTION TRACKER VIEW */}
          {view === 'todos' && (
            <div className="animate-fadeIn">
              <TodosView
                todos={todos}
                currency={currency}
                onUpdateTodo={handleSaveTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onOpenAddModal={handleOpenAddTodo}
                onOpenEditModal={handleOpenEditTodo}
                theme={theme}
              />
            </div>
          )}

          {/* SALARY & BUDGET ALLOCATION VIEW */}
          {view === 'salary' && (
            <div className="animate-fadeIn">
              <SalaryAllocationView
                salaryConfig={salaryConfig}
                onUpdateSalaryConfig={setSalaryConfig}
                currency={currency}
                transactions={transactions}
                onAddTransaction={handleDepositSalary}
                theme={theme}
              />
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {view === 'analytics' && (
            <div className="animate-fadeIn">
              <AnalyticsView transactions={transactions} currency={currency} theme={theme} />
            </div>
          )}

          {/* MASTER USER ADMINISTRATION VIEW - STRICTLY RESTRICTED TO MASTER ADMIN */}
          {view === 'users' && currentUser && (currentUser.role === 'admin' || currentUser.loginId === 'admin') && (
            <div className="animate-fadeIn">
              <MasterUserManagement
                currentUser={currentUser}
                currency={currency}
                theme={theme}
                uiColorTheme={activeColorTheme}
                onSwitchToUser={(targetUser) => {
                  const vault = getUserVaultData(targetUser.loginId);
                  handleAuthenticated(targetUser, vault);
                  setView('dashboard');
                }}
              />
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === 'settings' && (
            <div className="animate-fadeIn">
              <SettingsView
                theme={theme}
                onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
                transactions={transactions}
                onSetTransactions={setTransactions}
                creditCards={creditCards}
                onSetCreditCards={setCreditCards}
                friendBorrowings={friendBorrowings}
                onSetFriendBorrowings={setFriendBorrowings}
                todos={todos}
                onSetTodos={setTodos}
                salaryConfig={salaryConfig}
                onSetSalaryConfig={setSalaryConfig}
                uiColor={uiColor}
                onSelectUIColor={setUiColor}
                headerStyle={headerStyle}
                onSelectHeaderStyle={setHeaderStyle}
                currentUser={currentUser}
                googleSheetSync={googleSheetSync}
                onSyncComplete={(syncInfo) => setGoogleSheetSync(syncInfo)}
                onOpenAccountModal={() => setAccountModalOpen(true)}
                onOpenMasterAccess={() => setView('users')}
                onLockVault={handleLockVault}
                onSignOut={handleSignOut}
              />
            </div>
          )}
        </div>
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        initialTransaction={editingTransaction}
        currency={currency}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        theme={theme}
      />

      {/* Credit Card Borrowing Modal */}
      <UpdateCreditCardModal
        card={editingCreditCard}
        currency={currency}
        isOpen={creditCardModalOpen}
        onClose={() => {
          setCreditCardModalOpen(false);
          setEditingCreditCard(null);
        }}
        onSave={handleSaveCreditCard}
        onDelete={handleDeleteCreditCard}
        theme={theme}
      />

      {/* Friend Borrowing & Repayment Modal */}
      <UpdateFriendBorrowingModal
        borrowing={editingFriendBorrowing}
        currency={currency}
        isOpen={friendModalOpen}
        onClose={() => {
          setFriendModalOpen(false);
          setEditingFriendBorrowing(null);
        }}
        onSave={handleSaveFriendBorrowing}
        onDelete={handleDeleteFriendBorrowing}
        theme={theme}
      />

      {/* To-Do Item Modal (Add / Edit) */}
      <TodoModal
        todo={editingTodo}
        isOpen={todoModalOpen}
        onClose={() => {
          setTodoModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        onDelete={handleDeleteTodo}
        currency={currency}
        theme={theme}
      />

      {/* Theme & Header Color Customization Modal */}
      <ThemeColorModal
        isOpen={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        currentColor={uiColor}
        onSelectColor={setUiColor}
        currentHeaderStyle={headerStyle}
        onSelectHeaderStyle={setHeaderStyle}
        theme={theme}
      />

      {/* Account Profile & User Switcher Modal */}
      {currentUser && (
        <AccountSwitcherModal
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          currentUser={currentUser}
          onSwitchUserSuccess={handleSwitchUserSuccess}
          onLockVault={handleLockVault}
          onSignOut={handleSignOut}
          onOpenNewAccountCreation={() => {
            handleSignOut();
          }}
          theme={theme}
        />
      )}

      {/* Bottom Nav for Mobile */}
      <MobileNav
        view={view}
        onViewChange={setView}
        onOpenNewTransaction={handleOpenNew}
        theme={theme}
        todosCount={pendingTodosCount}
        uiColorTheme={activeColorTheme}
        currentUser={currentUser}
      />
    </div>
  );
}
