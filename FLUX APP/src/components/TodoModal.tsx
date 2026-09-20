import React, { useState, useEffect } from 'react';
import { TodoItem, TodoPriority, TodoCategory, CurrencyConfig } from '../types';
import {
  X,
  CheckSquare,
  Square,
  Calendar,
  DollarSign,
  Tag,
  AlertCircle,
  Trash2,
  Check,
  FileText,
  Clock,
} from 'lucide-react';

interface TodoModalProps {
  todo: TodoItem | null; // null for add, object for edit
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: TodoItem) => void;
  onDelete?: (id: string | number) => void;
  currency?: CurrencyConfig;
  theme?: 'dark' | 'light';
}

const CATEGORIES: { id: TodoCategory; label: string; color: string }[] = [
  { id: 'bills', label: 'Bills & Utilities', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  { id: 'debts', label: 'Debts & Repayments', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
  { id: 'financial', label: 'Financial & Budget', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  { id: 'personal', label: 'Personal', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { id: 'general', label: 'General Task', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
];

const PRIORITIES: { id: TodoPriority; label: string; color: string; dot: string }[] = [
  { id: 'high', label: 'High Priority', color: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  { id: 'medium', label: 'Medium Priority', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  { id: 'low', label: 'Low Priority', color: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
];

export const TodoModal: React.FC<TodoModalProps> = ({
  todo,
  isOpen,
  onClose,
  onSave,
  onDelete,
  currency,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isEditing = Boolean(todo);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [category, setCategory] = useState<TodoCategory>('financial');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '');
      setDescription(todo.description || '');
      setCompleted(todo.completed || false);
      setPriority(todo.priority || 'medium');
      setCategory(todo.category || 'financial');
      setDueDate(todo.dueDate || '');
      setAmount(todo.amount !== undefined && todo.amount !== null ? String(todo.amount) : '');
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
      setPriority('medium');
      setCategory('financial');
      setDueDate('');
      setAmount('');
    }
    setError(null);
  }, [todo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const parsedAmount = amount.trim() ? parseFloat(amount) : undefined;
    if (parsedAmount !== undefined && (isNaN(parsedAmount) || parsedAmount < 0)) {
      setError('Please enter a valid non-negative amount.');
      return;
    }

    const nowIso = new Date().toISOString().split('T')[0];

    const updatedItem: TodoItem = {
      id: todo ? todo.id : `todo-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      completed,
      priority,
      category,
      dueDate: dueDate || undefined,
      amount: parsedAmount,
      completedAt: completed ? (todo?.completedAt || nowIso) : undefined,
      createdAt: todo?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    onSave(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <CheckSquare size={17} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {isEditing ? 'Update To-Do Item' : 'New To-Do Task'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isEditing ? 'Modify task details, priority, or status' : 'Add a task or financial reminder to your list'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Pay credit card bill, Review subscription trial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
              }`}
            />
          </div>

          {/* Status Toggle (Completed / Active) */}
          <div
            onClick={() => setCompleted(!completed)}
            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
              completed
                ? isDark
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : isDark
                ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {completed ? (
                <CheckSquare size={18} className="text-emerald-500" />
              ) : (
                <Square size={18} className="text-slate-400" />
              )}
              <span className="text-xs font-semibold">
                {completed ? 'Status: Completed' : 'Status: Pending / Active'}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                completed
                  ? 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {completed ? 'Marked Done' : 'Click to Complete'}
            </span>
          </div>

          {/* Two Column: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Tag size={12} />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TodoCategory)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock size={12} />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? isDark
                            ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                            : 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                          : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                      <span className="capitalize">{p.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Two Column: Due Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Calendar size={12} />
                <span>Due Date (Optional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            {/* Optional Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <DollarSign size={12} />
                <span>Amount ({currency?.symbol || '$'}, Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">
                  {currency?.symbol || '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 rounded-xl border text-xs font-mono font-medium transition-all ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <FileText size={12} />
              <span>Notes & Details</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add instructions, account numbers, context, or reminder notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed transition-all resize-none ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700 text-slate-200 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this task?')) {
                    onDelete(todo!.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow active:scale-95 transition-all"
              >
                <Check size={14} />
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
