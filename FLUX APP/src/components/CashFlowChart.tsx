import React, { useState, useMemo } from 'react';
import { Transaction, TimeRange, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

interface CashFlowChartProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  theme?: 'dark' | 'light';
}

interface DailyPoint {
  dateStr: string;
  displayDate: string;
  income: number;
  expense: number;
  net: number;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions, currency, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeSeries, setActiveSeries] = useState<'all' | 'income' | 'expense'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 60;

  // Build continuous time series data
  const data: DailyPoint[] = useMemo(() => {
    const points: DailyPoint[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Calculate totals for this date
      const dayTxns = transactions.filter((t) => t.date === isoDate);
      const income = dayTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      points.push({
        dateStr: isoDate,
        displayDate,
        income,
        expense,
        net: income - expense,
      });
    }

    return points;
  }, [transactions, daysCount]);

  // Aggregate totals in selected period
  const periodTotals = useMemo(() => {
    const totalIncome = data.reduce((acc, p) => acc + p.income, 0);
    const totalExpense = data.reduce((acc, p) => acc + p.expense, 0);
    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    };
  }, [data]);

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const padTop = 20;
  const padBottom = 35;
  const padLeft = 10;
  const padRight = 10;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const maxVal = useMemo(() => {
    const peak = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000);
    return peak * 1.15; // 15% headroom
  }, [data]);

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxVal));
    return padTop + plotHeight - (clamped / maxVal) * plotHeight;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (data.length - 1)) * plotWidth;
  };

  // Generate SVG area and line path strings
  const buildPaths = (key: 'income' | 'expense') => {
    if (data.length === 0) return { line: '', area: '' };

    const pts = data.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));

    // Smooth path using cubic bezier
    let linePath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const baselineY = padTop + plotHeight;
    const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${baselineY} L ${pts[0].x} ${baselineY} Z`;

    return { line: linePath, area: areaPath };
  };

  const incomePaths = useMemo(() => buildPaths('income'), [data, maxVal]);
  const expensePaths = useMemo(() => buildPaths('expense'), [data, maxVal]);

  const activeHoverPoint = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;

  return (
    <div
      className={`card rounded-xl p-5 relative overflow-hidden transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
          : 'bg-white border border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-indigo-600/10' : 'bg-indigo-500/5'
        }`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-emerald-600/10' : 'bg-emerald-500/5'
        }`}
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Cash Flow Velocity
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                isDark
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
              }`}
            >
              Live Vector Trend
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time income and expense trajectory across time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Series selector */}
          <div
            className={`inline-flex rounded-lg p-0.5 border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              id="chart-series-all-btn"
              onClick={() => setActiveSeries('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                activeSeries === 'all'
                  ? isDark
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'bg-white text-slate-900 shadow-sm font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              id="chart-series-income-btn"
              onClick={() => setActiveSeries('income')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                activeSeries === 'income'
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-emerald-400'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Income
            </button>
            <button
              id="chart-series-expense-btn"
              onClick={() => setActiveSeries('expense')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                activeSeries === 'expense'
                  ? isDark
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-rose-50 text-rose-700 border border-rose-300 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-rose-400'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Expense
            </button>
          </div>

          {/* Time range selector */}
          <div
            className={`inline-flex rounded-lg p-0.5 border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(['7d', '14d', '30d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                id={`chart-range-${range}-btn`}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick period summary metrics */}
      <div
        className={`grid grid-cols-3 gap-3 mb-4 p-2.5 rounded-lg border ${
          isDark
            ? 'bg-slate-950/50 border-slate-800/80'
            : 'bg-slate-50/80 border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <TrendingUp size={14} />
          </div>
          <div>
            <div className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Inflow
            </div>
            <div className={`text-xs sm:text-sm font-semibold font-mono-numbers ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              +{formatCurrency(periodTotals.income, currency)}
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 border-l pl-3 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}
          >
            <TrendingDown size={14} />
          </div>
          <div>
            <div className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Outflow
            </div>
            <div className={`text-xs sm:text-sm font-semibold font-mono-numbers ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              -{formatCurrency(periodTotals.expense, currency)}
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 border-l pl-3 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
              isDark
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}
          >
            <ArrowRightLeft size={14} />
          </div>
          <div>
            <div className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Net Spread
            </div>
            <div
              className={`text-xs sm:text-sm font-semibold font-mono-numbers ${
                periodTotals.net >= 0
                  ? isDark
                    ? 'text-indigo-300'
                    : 'text-indigo-600'
                  : isDark
                  ? 'text-rose-400'
                  : 'text-rose-600'
              }`}
            >
              {periodTotals.net >= 0 ? '+' : ''}
              {formatCurrency(periodTotals.net, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Emerald Income Gradient */}
            <linearGradient id="neonIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? "0.32" : "0.22"} />
              <stop offset="80%" stopColor="#10b981" stopOpacity={isDark ? "0.03" : "0.02"} />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            {/* Rose Expense Gradient */}
            <linearGradient id="neonExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={isDark ? "0.32" : "0.22"} />
              <stop offset="80%" stopColor="#f43f5e" stopOpacity={isDark ? "0.03" : "0.02"} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>

            {/* Neon Line Filters */}
            <filter id="neonGlowIncome" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={isDark ? "3" : "1"} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonGlowExpense" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={isDark ? "3" : "1"} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal grid guide lines */}
          {[0.25, 0.5, 0.75, 1].map((fraction, idx) => {
            const lineY = padTop + plotHeight * (1 - fraction);
            const val = maxVal * fraction;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={lineY}
                  x2={svgWidth - padRight}
                  y2={lineY}
                  stroke={isDark ? "#1e293b" : "#f1f5f9"}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft + 6}
                  y={lineY - 4}
                  fill={isDark ? "#475569" : "#94a3b8"}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {formatCurrency(val, currency)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={padLeft}
            y1={padTop + plotHeight}
            x2={svgWidth - padRight}
            y2={padTop + plotHeight}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeWidth="1.5"
          />

          {/* Income Area & Line */}
          {(activeSeries === 'all' || activeSeries === 'income') && (
            <g className="transition-opacity duration-300">
              <path d={incomePaths.area} fill="url(#neonIncomeGrad)" />
              <path
                d={incomePaths.line}
                fill="none"
                stroke={isDark ? "#10b981" : "#059669"}
                strokeWidth="2.5"
                filter="url(#neonGlowIncome)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Expense Area & Line */}
          {(activeSeries === 'all' || activeSeries === 'expense') && (
            <g className="transition-opacity duration-300">
              <path d={expensePaths.area} fill="url(#neonExpenseGrad)" />
              <path
                d={expensePaths.line}
                fill="none"
                stroke={isDark ? "#fb7185" : "#e11d48"}
                strokeWidth="2.5"
                filter="url(#neonGlowExpense)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Interactive hover column slices */}
          {data.map((point, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            const incY = getY(point.income);
            const expY = getY(point.expense);

            return (
              <g
                key={point.dateStr}
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-crosshair"
              >
                {/* Hit area */}
                <rect
                  x={x - plotWidth / (data.length * 2)}
                  y={padTop}
                  width={plotWidth / data.length}
                  height={plotHeight + 20}
                  fill="transparent"
                />

                {/* Vertical cursor guideline when hovered */}
                {isHovered && (
                  <g>
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={padTop + plotHeight}
                      stroke={isDark ? "#6366f1" : "#4f46e5"}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.85"
                    />

                    {/* Data markers on hovered point */}
                    {(activeSeries === 'all' || activeSeries === 'income') && point.income > 0 && (
                      <circle
                        cx={x}
                        cy={incY}
                        r="4.5"
                        fill={isDark ? "#020617" : "#ffffff"}
                        stroke={isDark ? "#10b981" : "#059669"}
                        strokeWidth="2.5"
                      />
                    )}
                    {(activeSeries === 'all' || activeSeries === 'expense') && point.expense > 0 && (
                      <circle
                        cx={x}
                        cy={expY}
                        r="4.5"
                        fill={isDark ? "#020617" : "#ffffff"}
                        stroke={isDark ? "#fb7185" : "#e11d48"}
                        strokeWidth="2.5"
                      />
                    )}
                  </g>
                )}

                {/* X-axis tick labels for selected interval points */}
                {(i === 0 ||
                  i === Math.floor(data.length / 2) ||
                  i === data.length - 1 ||
                  (data.length <= 14 && i % 2 === 0)) && (
                  <text
                    x={x}
                    y={padTop + plotHeight + 18}
                    textAnchor="middle"
                    fill={isDark ? "#64748b" : "#64748b"}
                    fontSize="10"
                    fontWeight="500"
                  >
                    {point.displayDate}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeHoverPoint && hoveredIndex !== null && (
          <div
            className={`pointer-events-none absolute top-2 transform -translate-x-1/2 rounded-lg p-2.5 z-30 transition-all text-xs border ${
              isDark
                ? 'bg-slate-950/95 border-indigo-500/40 text-slate-200 shadow-2xl backdrop-blur-md'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
            style={{
              left: `${(getX(hoveredIndex) / svgWidth) * 100}%`,
              maxWidth: '180px',
            }}
          >
            <div className={`font-semibold mb-1 border-b pb-1 flex justify-between items-center ${isDark ? 'text-slate-300 border-slate-800' : 'text-slate-900 border-slate-100'}`}>
              <span>{activeHoverPoint.displayDate}</span>
              <span className={`text-[10px] font-mono font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Net: {activeHoverPoint.net >= 0 ? '+' : ''}{formatCurrency(activeHoverPoint.net, currency)}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Inflow:
                </span>
                <span className={`font-mono-numbers font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  +{formatCurrency(activeHoverPoint.income, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Outflow:
                </span>
                <span className={`font-mono-numbers font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                  -{formatCurrency(activeHoverPoint.expense, currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
