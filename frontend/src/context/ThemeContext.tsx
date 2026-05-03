import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeId, ThemeTokens, themes } from '../themes/tokens';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeTokens;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'fitiq.theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'aurora' || saved === 'graphite' || saved === 'neon') return saved;
    return 'aurora';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, theme: themes[themeId], setTheme: setThemeId }),
    [themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
