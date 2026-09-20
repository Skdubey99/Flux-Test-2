import React from 'react';
import { UIColorId, HeaderStyleId, UIColorTheme } from '../types';
import { UI_COLOR_THEMES, HEADER_STYLE_OPTIONS, getUIColorTheme } from '../utils/themeColors';
import {
  Palette,
  Check,
  X,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Layers,
  LayoutTemplate,
} from 'lucide-react';

interface ThemeColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: UIColorId;
  onSelectColor: (colorId: UIColorId) => void;
  currentHeaderStyle: HeaderStyleId;
  onSelectHeaderStyle: (styleId: HeaderStyleId) => void;
  theme: 'dark' | 'light';
  onToggleTheme?: () => void;
  activeThemeConfig?: UIColorTheme;
}

export const ThemeColorModal: React.FC<ThemeColorModalProps> = ({
  isOpen,
  onClose,
  currentColor,
  onSelectColor,
  currentHeaderStyle,
  onSelectHeaderStyle,
  theme,
  onToggleTheme,
  activeThemeConfig,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const themeConfig = activeThemeConfig || getUIColorTheme(currentColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header Bar - Light and Airy */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: isDark ? themeConfig.darkHex : themeConfig.hex }}
            >
              <Palette size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Customize UI & Color Theme</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Choose your primary accent color and header bar luminosity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Close theme modal"
          >
            <X size={18} />
          </button>
        </div>


        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Color Palettes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary UI Accent Color
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                Active: <strong className="text-slate-800 dark:text-slate-200">{themeConfig.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {UI_COLOR_THEMES.map((c) => {
                const isSelected = currentColor === c.id;
                const swatchHex = isDark ? c.darkHex : c.hex;

                return (
                  <button
                    key={c.id}
                    id={`color-option-${c.id}`}
                    onClick={() => onSelectColor(c.id)}
                    className={`relative p-3 rounded-xl border text-left flex flex-col gap-2 transition-all group ${
                      isSelected
                        ? isDark
                          ? 'border-slate-400 ring-2 ring-slate-400/30 bg-slate-800/80 shadow-md'
                          : 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-50/80 shadow-sm'
                        : isDark
                        ? 'border-slate-800/90 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/60'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: swatchHex }}
                        >
                          {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                        </span>
                        <span
                          className="w-2.5 h-2.5 rounded-full opacity-60 shrink-0"
                          style={{ backgroundColor: c.darkHex }}
                          title="Dark mode variant"
                        />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                          Active
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold block truncate text-slate-800 dark:text-slate-100">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                        {c.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Header Bar Appearance & Lightness */}
          <div className="space-y-3 pt-2 border-t dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <LayoutTemplate size={13} />
                  <span>Header Bar Tone & Luminosity</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Select how bright and light your top header bar appears
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEADER_STYLE_OPTIONS.map((style) => {
                const isSelected = currentHeaderStyle === style.id;

                return (
                  <button
                    key={style.id}
                    id={`header-style-${style.id}`}
                    onClick={() => onSelectHeaderStyle(style.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? isDark
                          ? 'border-slate-400 ring-2 ring-slate-400/30 bg-slate-800/80'
                          : 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-50'
                        : isDark
                        ? 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {style.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Dark / Light Mode Quick Switch */}
          {onToggleTheme && (
            <div className="space-y-3 pt-2 border-t dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sun size={13} />
                  <span>Base Display Mode</span>
                </label>

                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => theme !== 'light' && onToggleTheme()}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      !isDark
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun size={13} />
                    <span>Light Mode</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && onToggleTheme()}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isDark
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Moon size={13} />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Live UI Preview Box */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/70 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Live UI Element Preview</span>
              <span className="flex items-center gap-1">
                <Sparkles size={11} style={{ color: isDark ? themeConfig.darkHex : themeConfig.hex }} />
                <span>Synchronized</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sample Action Button */}
              <button
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all"
                style={{
                  backgroundColor: isDark ? themeConfig.darkHex : themeConfig.hex,
                }}
              >
                Primary Button
              </button>

              {/* Sample Badge */}
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : themeConfig.lightBgHex,
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : themeConfig.lightBorderHex,
                  color: isDark ? themeConfig.darkHex : themeConfig.hex,
                }}
              >
                Active Status Badge
              </span>

              {/* Sample Active Nav Pill */}
              <span
                className="px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : themeConfig.lightBgHex,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : themeConfig.lightBorderHex,
                  color: isDark ? themeConfig.darkHex : themeConfig.hex,
                }}
              >
                <Check size={12} />
                <span>Selected Navigation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-100'
          }`}
        >
          <span className="text-[11px] text-slate-400">
            Changes are applied immediately and saved locally.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: isDark ? themeConfig.darkHex : themeConfig.hex,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
