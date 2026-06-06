import { Heart, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const THEME_KEY = 'gemb-theme';

const themes = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'pink', label: 'Pink', icon: Heart }
];

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(THEME_KEY) || 'light';
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
};

export default function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => setTheme(getStoredTheme());
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('gemb-theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('gemb-theme-change', handleThemeChange);
    };
  }, []);

  const handleThemeClick = (nextTheme) => {
    applyTheme(nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('gemb-theme-change'));
  };

  return (
    <div className={`theme-toggle ${compact ? 'compact' : ''}`} role="group" aria-label="Tema visual">
      {themes.map((item) => {
        const Icon = item.icon;
        const isActive = theme === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`theme-option ${isActive ? 'active' : ''}`}
            onClick={() => handleThemeClick(item.id)}
            aria-pressed={isActive}
            title={`Tema ${item.label}`}
          >
            <Icon size={compact ? 15 : 16} />
            {!compact && <span>{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
