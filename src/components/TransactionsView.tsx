import React, { useState, useMemo } from 'react';
import { Transaction, CurrencyConfig } from '../types';
import { TransactionRow } from './TransactionRow';
import { formatCurrency } from '../utils/currencies';
import { CATEGORIES } from '../data/defaultTransactions';
import { Search, Download, Plus, ArrowUpDown, Filter, X } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string | number) => void;
  onOpenNew: () => void;
  theme?: 'dark' | 'light';
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  currency,
  onEdit,
  onDelete,
  onOpenNew,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filtered and sorted list
  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        if (selectedCategory !== 'all' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          // Filter by category
          const matchCategory = (t.category || '').toLowerCase().includes(term);
          // Filter by description (checks note or description field)
          const matchDescription =
            (t.note || '').toLowerCase().includes(term) ||
            ((t as any).description || '').toLowerCase().includes(term);
          // Filter by amount (raw number, formatted currency, or localized amount)
          const rawAmount = t.amount.toString();
          const formattedAmount = formatCurrency(t.amount, currency).toLowerCase();
          const localizedAmount = t.amount.toLocaleString().toLowerCase();
          const matchAmount =
            rawAmount.includes(term) ||
            formattedAmount.includes(term) ||
            localizedAmount.includes(term);
          // Also allow searching account name if present
          const matchAccount = (t.account || '').toLowerCase().includes(term);

          if (!matchCategory && !matchDescription && !matchAmount && !matchAccount) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchTerm, selectedType, selectedCategory, sortBy, currency]);

  // Aggregate stats of current filtered list
  const filteredSummary = useMemo(() => {
    const inc = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { inc, exp, net: inc - exp };
  }, [filtered]);

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Currency', 'Account', 'Note'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      currency.code,
      `"${(t.account || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flux_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = searchTerm !== '' || selectedType !== 'all' || selectedCategory !== 'all';

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div
        className={`card rounded-xl p-4 transition-colors duration-200 space-y-3 ${
          isDark
            ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
            : 'bg-white border border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="txn-search-input"
              data-testid="transaction-search-input"
              type="text"
              placeholder="Search by description, category, or amount..."
              aria-label="Search transactions by description, category, or amount"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs sm:text-sm transition-colors focus:outline-none ${
                isDark
                  ? 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                id="clear-txn-search-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
              }`}
              title="Download CSV Ledger"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>

            <button
              id="toolbar-new-entry-btn"
              onClick={onOpenNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider text-white shadow-sm shadow-indigo-500/30 transition-all"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Sorters */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
            isDark ? 'border-slate-800/80' : 'border-slate-100'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div
              className={`inline-flex rounded-lg p-0.5 border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                id="filter-type-all"
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedType === 'all'
                    ? isDark
                      ? 'bg-slate-800 text-slate-100 font-semibold'
                      : 'bg-white text-slate-900 font-semibold shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                id="filter-type-income"
                onClick={() => setSelectedType('income')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedType === 'income'
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300'
                    : isDark
                    ? 'text-slate-400 hover:text-emerald-400'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                + Income
              </button>
              <button
                id="filter-type-expense"
                onClick={() => setSelectedType('expense')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedType === 'expense'
                    ? isDark
                      ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                      : 'bg-rose-50 text-rose-700 font-semibold border border-rose-300'
                    : isDark
                    ? 'text-slate-400 hover:text-rose-400'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                - Expense
              </button>
            </div>

            {/* Category select */}
            <div className="relative">
              <select
                id="filter-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] focus:outline-none focus:border-indigo-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                id="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown size={13} className="text-slate-400" />
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-2 py-1 rounded-lg border text-[11px] focus:outline-none ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Balance Summary Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-xs font-mono-numbers ${
          isDark
            ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
            : 'bg-slate-100/80 border-slate-200 text-slate-600'
        }`}
      >
        <span className="font-sans">
          Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filtered.length}</strong> of{' '}
          <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{transactions.length}</strong> records
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
            Inflow: +{formatCurrency(filteredSummary.inc, currency)}
          </span>
          <span className={isDark ? 'text-rose-400' : 'text-rose-600'}>
            Outflow: -{formatCurrency(filteredSummary.exp, currency)}
          </span>
          <span
            className={`font-semibold ${
              filteredSummary.net >= 0
                ? isDark
                  ? 'text-indigo-300'
                  : 'text-indigo-600'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }`}
          >
            Net: {filteredSummary.net >= 0 ? '+' : ''}
            {formatCurrency(filteredSummary.net, currency)}
          </span>
        </div>
      </div>

      {/* Transactions List Container */}
      <div
        className={`card rounded-xl p-3 shadow-sm divide-y transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/90 border border-slate-800 divide-slate-800/60'
            : 'bg-white border border-slate-200/90 divide-slate-100'
        }`}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Filter size={28} className="mx-auto text-slate-400 mb-2 stroke-[1.5]" />
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              No transactions located
            </p>
            <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No ledger entries matched your current search filters or date parameters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className={`mt-4 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium'
              }`}
            >
              Clear Search Criteria
            </button>
          </div>
        ) : (
          filtered.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              currency={currency}
              onEdit={onEdit}
              onDelete={onDelete}
              theme={theme}
            />
          ))
        )}
      </div>
    </div>
  );
};
