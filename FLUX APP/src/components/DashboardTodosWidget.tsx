import React from 'react';
import { TodoItem, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  CheckSquare,
  Square,
  ArrowRight,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface DashboardTodosWidgetProps {
  todos: TodoItem[];
  currency: CurrencyConfig;
  onNavigateToTodos: () => void;
  onToggleTodo: (id: string | number) => void;
  onOpenEditModal: (todo: TodoItem) => void;
  onOpenAddModal: () => void;
  theme?: 'dark' | 'light';
}

export const DashboardTodosWidget: React.FC<DashboardTodosWidgetProps> = ({
  todos,
  currency,
  onNavigateToTodos,
  onToggleTodo,
  onOpenEditModal,
  onOpenAddModal,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className={`card rounded-2xl p-5 border transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <CheckSquare size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                To-Do & Financial Tasks
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                {pendingTodos.length} Pending
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Check off tasks or click update to adjust dates and reminders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus size={13} />
            <span>Add Task</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            onClick={onNavigateToTodos}
            className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
              isDark
                ? 'text-indigo-400 hover:text-indigo-300'
                : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Task List Preview (top 4 active or recently updated) */}
      {todos.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No tasks added yet. Click &quot;Add Task&quot; to create your first to-do item.
        </div>
      ) : (
        <div className="space-y-2">
          {(pendingTodos.length > 0 ? pendingTodos.slice(0, 4) : todos.slice(0, 4)).map((todo) => {
            const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < todayStr;

            return (
              <div
                key={todo.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  isDark
                    ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <button
                    onClick={() => onToggleTodo(todo.id)}
                    className="p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                  >
                    {todo.completed ? (
                      <CheckSquare size={17} className="text-emerald-500" />
                    ) : (
                      <Square size={17} />
                    )}
                  </button>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold truncate ${
                          todo.completed
                            ? 'line-through text-slate-400'
                            : isDark
                            ? 'text-slate-200'
                            : 'text-slate-800'
                        }`}
                      >
                        {todo.title}
                      </span>
                      {todo.priority === 'high' && !todo.completed && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                          High
                        </span>
                      )}
                      {todo.amount !== undefined && todo.amount > 0 && (
                        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {formatCurrency(todo.amount, currency)}
                        </span>
                      )}
                    </div>

                    {todo.dueDate && !todo.completed && (
                      <div
                        className={`text-[10px] flex items-center gap-1 ${
                          isOverdue ? 'text-rose-500 font-bold' : 'text-slate-400'
                        }`}
                      >
                        <Calendar size={10} />
                        <span>{isOverdue ? `Overdue (${todo.dueDate})` : `Due: ${todo.dueDate}`}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenEditModal(todo)}
                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Widget Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>{completedTodos.length} tasks completed</span>
        </div>
        <button
          onClick={onNavigateToTodos}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>Open Full To-Do Manager</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
