import { UIColorId, HeaderStyleId, UIColorTheme } from '../types';

export const UI_COLOR_THEMES: UIColorTheme[] = [
  {
    id: 'blue',
    name: 'Corporate Navy',
    description: 'Institutional banking clarity and authority',
    hex: '#1d4ed8',
    darkHex: '#3b82f6',
    hoverHex: '#1e40af',
    lightBgHex: '#eff6ff',
    lightBorderHex: '#bfdbfe',
    glowRgba: 'rgba(29, 78, 216, 0.25)',
    classes: {
      primaryBg: 'bg-blue-700 hover:bg-blue-600 text-white',
      primaryText: 'text-blue-700 dark:text-blue-400',
      lightBg: 'bg-blue-50/90 dark:bg-blue-500/15',
      border: 'border-blue-200/80 dark:border-blue-500/30',
      badge: 'bg-blue-50 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200/70 dark:border-blue-500/30',
      activeNav: 'bg-blue-50/90 text-blue-800 border-blue-200/90 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 shadow-[0_0_15px_-4px_rgba(59,130,246,0.25)]',
      shadow: 'shadow-blue-500/25',
      ring: 'focus:ring-blue-500',
    },
  },
  {
    id: 'slate',
    name: 'Monochrome Carbon',
    description: 'Classic Wall Street ledger graphite & steel',
    hex: '#334155',
    darkHex: '#94a3b8',
    hoverHex: '#1e293b',
    lightBgHex: '#f8fafc',
    lightBorderHex: '#cbd5e1',
    glowRgba: 'rgba(51, 65, 85, 0.25)',
    classes: {
      primaryBg: 'bg-slate-800 hover:bg-slate-700 text-white',
      primaryText: 'text-slate-800 dark:text-slate-200',
      lightBg: 'bg-slate-100 dark:bg-slate-800/60',
      border: 'border-slate-300 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
      activeNav: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800/80 dark:text-white dark:border-slate-700 shadow-sm',
      shadow: 'shadow-slate-500/25',
      ring: 'focus:ring-slate-500',
    },
  },
  {
    id: 'emerald',
    name: 'Institutional Green',
    description: 'Solvent balance, positive liquidity & asset growth',
    hex: '#059669',
    darkHex: '#10b981',
    hoverHex: '#047857',
    lightBgHex: '#ecfdf5',
    lightBorderHex: '#a7f3d0',
    glowRgba: 'rgba(5, 150, 105, 0.25)',
    classes: {
      primaryBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      primaryText: 'text-emerald-600 dark:text-emerald-400',
      lightBg: 'bg-emerald-50/80 dark:bg-emerald-500/15',
      border: 'border-emerald-200/80 dark:border-emerald-500/30',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/30',
      activeNav: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/90 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 shadow-[0_0_15px_-4px_rgba(16,185,129,0.25)]',
      shadow: 'shadow-emerald-500/25',
      ring: 'focus:ring-emerald-500',
    },
  },
  {
    id: 'indigo',
    name: 'Executive Cobalt',
    description: 'High-contrast professional fintech',
    hex: '#4f46e5',
    darkHex: '#6366f1',
    hoverHex: '#4338ca',
    lightBgHex: '#eef2ff',
    lightBorderHex: '#c7d2fe',
    glowRgba: 'rgba(79, 70, 229, 0.25)',
    classes: {
      primaryBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      primaryText: 'text-indigo-600 dark:text-indigo-400',
      lightBg: 'bg-indigo-50/80 dark:bg-indigo-500/15',
      border: 'border-indigo-200/80 dark:border-indigo-500/30',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30',
      activeNav: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/90 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30 shadow-[0_0_15px_-4px_rgba(99,102,241,0.25)]',
      shadow: 'shadow-indigo-500/25',
      ring: 'focus:ring-indigo-500',
    },
  },
  {
    id: 'violet',
    name: 'Royal Amethyst',
    description: 'Modern neo-bank luxury and elegance',
    hex: '#7c3aed',
    darkHex: '#a855f7',
    hoverHex: '#6d28d9',
    lightBgHex: '#f5f3ff',
    lightBorderHex: '#ddd6fe',
    glowRgba: 'rgba(124, 58, 237, 0.25)',
    classes: {
      primaryBg: 'bg-violet-600 hover:bg-violet-500 text-white',
      primaryText: 'text-violet-600 dark:text-violet-400',
      lightBg: 'bg-violet-50/80 dark:bg-violet-500/15',
      border: 'border-violet-200/80 dark:border-violet-500/30',
      badge: 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200/70 dark:border-violet-500/30',
      activeNav: 'bg-violet-50/90 text-violet-700 border-violet-200/90 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30 shadow-[0_0_15px_-4px_rgba(168,85,247,0.25)]',
      shadow: 'shadow-violet-500/25',
      ring: 'focus:ring-violet-500',
    },
  },
  {
    id: 'rose',
    name: 'Coral Crimson',
    description: 'Vibrant, high-energy modern coral',
    hex: '#e11d48',
    darkHex: '#fb7185',
    hoverHex: '#be123c',
    lightBgHex: '#fff1f2',
    lightBorderHex: '#fecdd3',
    glowRgba: 'rgba(225, 29, 72, 0.25)',
    classes: {
      primaryBg: 'bg-rose-600 hover:bg-rose-500 text-white',
      primaryText: 'text-rose-600 dark:text-rose-400',
      lightBg: 'bg-rose-50/80 dark:bg-rose-500/15',
      border: 'border-rose-200/80 dark:border-rose-500/30',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200/70 dark:border-rose-500/30',
      activeNav: 'bg-rose-50/90 text-rose-700 border-rose-200/90 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 shadow-[0_0_15px_-4px_rgba(251,113,133,0.25)]',
      shadow: 'shadow-rose-500/25',
      ring: 'focus:ring-rose-500',
    },
  },
  {
    id: 'amber',
    name: 'Aura Amber & Stone',
    description: 'Warm sand, burnished brass, and mindful clarity',
    hex: '#b45309',
    darkHex: '#fbbf24',
    hoverHex: '#92400e',
    lightBgHex: '#fef3c7',
    lightBorderHex: '#fde68a',
    glowRgba: 'rgba(180, 83, 9, 0.25)',
    classes: {
      primaryBg: 'bg-amber-700 hover:bg-amber-600 text-white',
      primaryText: 'text-amber-700 dark:text-amber-400',
      lightBg: 'bg-amber-50/90 dark:bg-amber-500/15',
      border: 'border-amber-200/80 dark:border-amber-500/30',
      badge: 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200/70 dark:border-amber-500/30',
      activeNav: 'bg-amber-50/90 text-amber-800 border-amber-200/90 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 shadow-[0_0_15px_-4px_rgba(245,158,11,0.25)]',
      shadow: 'shadow-amber-500/25',
      ring: 'focus:ring-amber-500',
    },
  },
  {
    id: 'teal',
    name: 'Cyber Mint Teal',
    description: 'Refreshing digital cyan and balanced mint',
    hex: '#0d9488',
    darkHex: '#2dd4bf',
    hoverHex: '#0f766e',
    lightBgHex: '#f0fdfa',
    lightBorderHex: '#99f6e4',
    glowRgba: 'rgba(13, 148, 136, 0.25)',
    classes: {
      primaryBg: 'bg-teal-600 hover:bg-teal-500 text-white',
      primaryText: 'text-teal-600 dark:text-teal-400',
      lightBg: 'bg-teal-50/80 dark:bg-teal-500/15',
      border: 'border-teal-200/80 dark:border-teal-500/30',
      badge: 'bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200/70 dark:border-teal-500/30',
      activeNav: 'bg-teal-50/90 text-teal-700 border-teal-200/90 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30 shadow-[0_0_15px_-4px_rgba(45,212,191,0.25)]',
      shadow: 'shadow-teal-500/25',
      ring: 'focus:ring-teal-500',
    },
  },
  {
    id: 'slate',
    name: 'Monochrome Slate',
    description: 'Minimalist high-contrast graphite & carbon',
    hex: '#334155',
    darkHex: '#94a3b8',
    hoverHex: '#1e293b',
    lightBgHex: '#f8fafc',
    lightBorderHex: '#cbd5e1',
    glowRgba: 'rgba(51, 65, 85, 0.25)',
    classes: {
      primaryBg: 'bg-slate-800 hover:bg-slate-700 text-white',
      primaryText: 'text-slate-800 dark:text-slate-200',
      lightBg: 'bg-slate-100 dark:bg-slate-800/60',
      border: 'border-slate-300 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
      activeNav: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800/80 dark:text-white dark:border-slate-700 shadow-sm',
      shadow: 'shadow-slate-500/25',
      ring: 'focus:ring-slate-500',
    },
  },
];

export const DEFAULT_UI_COLOR_ID: UIColorId = 'blue';

export function getUIColorTheme(id: string = DEFAULT_UI_COLOR_ID): UIColorTheme {
  return UI_COLOR_THEMES.find((c) => c.id === id) || UI_COLOR_THEMES[0];
}

export interface HeaderStyleOption {
  id: HeaderStyleId;
  name: string;
  description: string;
}

export const HEADER_STYLE_OPTIONS: HeaderStyleOption[] = [
  {
    id: 'pure-light',
    name: 'Pristine Pure Light',
    description: 'Ultra-clean pure white canvas with subtle hairline divider',
  },
  {
    id: 'soft-cloud',
    name: 'Soft Cloud Light',
    description: 'Gentle neutral off-white with smooth feathering',
  },
  {
    id: 'luminous-tint',
    name: 'Luminous Palette Wash',
    description: 'Crisp light base enhanced by a soft luminous tint of your active UI color',
  },
  {
    id: 'elevated-dark',
    name: 'Elevated Slate Dark',
    description: 'Deep high-contrast elevated slate for low-light focus',
  },
];

export const DEFAULT_HEADER_STYLE_ID: HeaderStyleId = 'pure-light';

export function getHeaderStyleClasses(styleId: HeaderStyleId = 'pure-light', isDark: boolean): string {
  if (isDark) {
    return 'header-bar-elevated-dark';
  }

  switch (styleId) {
    case 'pure-light':
      return 'header-bar-pure-light';
    case 'soft-cloud':
      return 'header-bar-soft-cloud';
    case 'luminous-tint':
      return 'header-bar-luminous-tint';
    case 'elevated-dark':
      return 'header-bar-elevated-dark';
    default:
      return 'header-bar-pure-light';
  }
}

export function applyThemeVariables(colorInput: UIColorTheme | UIColorId, isDark: boolean) {
  const color = typeof colorInput === 'string' ? getUIColorTheme(colorInput) : colorInput;
  const root = document.documentElement;
  const activeHex = isDark ? color.darkHex : color.hex;
  
  root.style.setProperty('--accent', activeHex);
  root.style.setProperty('--accent-hover', color.hoverHex);
  root.style.setProperty('--accent-glow', isDark ? `rgba(255,255,255,0.1)` : color.glowRgba);
  root.style.setProperty('--accent-light', isDark ? 'rgba(255,255,255,0.06)' : color.lightBgHex);
  root.style.setProperty('--accent-border', isDark ? 'rgba(255,255,255,0.15)' : color.lightBorderHex);
  root.setAttribute('data-color', color.id);
}

