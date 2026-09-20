import React, { useState, useMemo } from 'react';
import { TodoItem, TodoPriority, TodoCategory, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  Check,
  Clock,
  Sparkles,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';

interface TodosViewProps {
  todos: TodoItem[];
  currency: CurrencyConfig;
  onUpdateTodo: (todo: TodoItem) => void;
  onToggleTodo: (id: string | number) => void;
  onDeleteTodo: (id: string | number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (todo: TodoItem) => void;
  theme?: 'dark' | 'light';
}

type StatusFilter = 'all' | 'active' | 'completed' | 'high_priority' | 'financial_debts';

export const TodosView: React.FC<TodosViewProps> = ({
  todos,
  currency,
  onUpdateTodo,
  onToggleTodo,
  onDeleteTodo,
  onOpenAddModal,
  onOpenEditModal,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickInput, setQuickInput] = useState('');
  const [quickCategory, setQuickCategory] = useState<TodoCategory>('financial');
  const [quickPriority, setQuickPriority] = useState<TodoPriority>('medium');

  // Statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const highPriorityCount = todos.filter((t) => !t.completed && t.priority === 'high').length;
  const financialDebtsCount = todos.filter(
    (t) => !t.completed && (t.category === 'bills' || t.category === 'debts' || t.category === 'financial')
  ).length;

  // Total pending financial liability/bills in todos
  const pendingFinancialAmount = useMemo(() => {
    return todos
      .filter((t) => !t.completed && t.amount !== undefined && t.amount > 0)
      .reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [todos]);

  // Today's date for overdue checks
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // Status
      if (statusFilter === 'active' && item.completed) return false;
      if (statusFilter === 'completed' && !item.completed) return false;
      if (statusFilter === 'high_priority' && item.priority !== 'high') return false;
      if (statusFilter === 'financial_debts' && item.category !== 'bills' && item.category !== 'debts' && item.category !== 'financial') {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      return true;
    });
  }, [todos, searchQuery, statusFilter, selectedCategory]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: quickInput.trim(),
      completed: false,
      priority: quickPriority,
      category: quickCategory,
      createdAt: todayStr,
    };

    onUpdateTodo(newTodo);
    setQuickInput('');
  };

  const getCategoryBadge = (cat: TodoCategory) => {
    switch (cat) {
      case 'bills':
        return { label: 'Bill / Utility', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/80' };
      case 'debts':
        return { label: 'Debt / Loan', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/80' };
      case 'financial':
        return { label: 'Financial', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80' };
      case 'personal':
        return { label: 'Personal', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80' };
      default:
        return { label: 'General', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const getPriorityBadge = (p: TodoPriority) => {
    switch (p) {
      case 'high':
        return { label: 'High', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
      case 'medium':
        return { label: 'Medium', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
      default:
        return { label: 'Low', color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Overview Card */}
      <div
        className={`card rounded-2xl p-6 border transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                Action Tracker
              </span>
              <span className="text-xs text-slate-400">Live Task Management</span>
            </div>
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Financial & Personal To-Do List
            </h2>
            <p className={`text-xs max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Keep track of credit card bill payments, friend repayments, subscription audits, and personal tasks in one unified ledger.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 min-w-[130px]">
              <div className="text-[11px] text-slate-400 font-medium">Pending Tasks</div>
              <div className="text-2xl font-bold font-mono-numbers text-indigo-600 dark:text-indigo-400">
                {activeCount}
              </div>
            </div>

            {pendingFinancialAmount > 0 && (
              <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 min-w-[150px]">
                <div className="text-[11px] text-slate-400 font-medium">Pending Amounts</div>
                <div className="text-2xl font-bold font-mono-numbers text-rose-600 dark:text-rose-400">
                  {formatCurrency(pendingFinancialAmount, currency)}
                </div>
              </div>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Completion Rate: {completionPercent}%</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center gap-2 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex-1 w-full flex items-center gap-2 px-3 py-1.5">
          <Plus size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Quick add a task (e.g. Pay internet bill, Check statement, Return $50)..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className={`w-full text-xs font-medium bg-transparent focus:outline-none ${
              isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value as TodoCategory)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${
              isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="financial">Financial</option>
            <option value="bills">Bills</option>
            <option value="debts">Debts</option>
            <option value="personal">Personal</option>
            <option value="general">General</option>
          </select>

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as TodoPriority)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${
              isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0"
          >
            Add
          </button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by keyword or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all' as StatusFilter, label: 'All', count: totalCount },
            { id: 'active' as StatusFilter, label: 'Active', count: activeCount },
            { id: 'high_priority' as StatusFilter, label: 'High Priority', count: highPriorityCount },
            { id: 'financial_debts' as StatusFilter, label: 'Bills & Debts', count: financialDebtsCount },
            { id: 'completed' as StatusFilter, label: 'Completed', count: completedCount },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? isDark
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-indigo-800 text-indigo-100'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        {filteredTodos.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div
              className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CheckSquare size={22} />
            </div>
            <div className="space-y-1">
              <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {todos.length === 0 ? 'No to-do tasks added yet' : 'No matching tasks found'}
              </h4>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {todos.length === 0
                  ? 'Add your first financial task, bill reminder, or personal to-do to stay organized.'
                  : 'Try clearing your search query or changing active filter tabs.'}
              </p>
            </div>
            {todos.length === 0 ? (
              <button
                onClick={onOpenAddModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={14} />
                <span>Create Task</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTodos.map((todo) => {
              const catBadge = getCategoryBadge(todo.category);
              const prioBadge = getPriorityBadge(todo.priority);
              const isOverdue =
                !todo.completed && todo.dueDate && todo.dueDate < todayStr;
              const isDueToday =
                !todo.completed && todo.dueDate && todo.dueDate === todayStr;

              return (
                <div
                  key={todo.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 transition-colors ${
                    todo.completed
                      ? isDark
                        ? 'bg-slate-950/20 opacity-70'
                        : 'bg-slate-50/40 opacity-75'
                      : isDark
                      ? 'hover:bg-slate-800/40'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Checkbox and Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className="mt-0.5 p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {todo.completed ? (
                        <CheckSquare size={20} className="text-emerald-500" />
                      ) : (
                        <Square size={20} className="text-slate-400 dark:text-slate-500 hover:border-indigo-500" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Title & Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold tracking-tight transition-all ${
                            todo.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : isDark
                              ? 'text-slate-100'
                              : 'text-slate-900'
                          }`}
                        >
                          {todo.title}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catBadge.bg}`}
                        >
                          {catBadge.label}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${prioBadge.color}`}
                        >
                          {prioBadge.label}
                        </span>

                        {/* Financial Amount Badge if attached */}
                        {todo.amount !== undefined && todo.amount > 0 && (
                          <span className="text-[11px] font-bold font-mono-numbers px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <span>{formatCurrency(todo.amount, currency)}</span>
                          </span>
                        )}
                      </div>

                      {/* Description / Notes */}
                      {todo.description && (
                        <p
                          className={`text-xs leading-relaxed max-w-2xl ${
                            todo.completed
                              ? 'text-slate-400 dark:text-slate-600 line-through'
                              : isDark
                              ? 'text-slate-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}

                      {/* Metadata Row: Due Date & Dates */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                        {todo.dueDate && (
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : isDueToday
                                ? 'text-amber-600 dark:text-amber-400 font-bold'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <Calendar size={12} />
                            <span>
                              {isOverdue && 'Overdue: '}
                              {isDueToday && 'Due Today: '}
                              {!isOverdue && !isDueToday && 'Due: '}
                              {todo.dueDate}
                            </span>
                          </div>
                        )}

                        {todo.completed && todo.completedAt && (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Check size={12} />
                            <span>Done on {todo.completedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <button
                      onClick={() => onOpenEditModal(todo)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                      }`}
                      title="Update task details"
                    >
                      <Edit2 size={13} />
                      <span className="hidden sm:inline">Update</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete task "${todo.title}"?`)) {
                          onDeleteTodo(todo.id);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs transition-colors ${
                        isDark
                          ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
