import { useEffect, useState } from 'react';

const THEME_KEY = 'gemb-theme';

const logoSources = {
  light: {
    full: '/brand/logo-light.png',
    icon: '/brand/app-icon-light.png'
  },
  dark: {
    full: '/brand/logo-dark.png',
    icon: '/brand/app-icon-dark.png'
  },
  pink: {
    full: '/brand/logo-pink.png',
    icon: '/brand/app-icon-pink.png'
  }
};

const normalizeTheme = (theme) => {
  if (theme === 'dark' || theme === 'pink') return theme;
  return 'light';
};

const readTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return normalizeTheme(document.documentElement.dataset.theme || localStorage.getItem(THEME_KEY));
};

export default function BrandLogo({ variant = 'full', className = '', alt = 'Gimnasio Emocional Mentes Brillantes' }) {
  const [theme, setTheme] = useState(readTheme);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme());
      setHasError(false);
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('storage', syncTheme);
    window.addEventListener('gemb-theme-change', syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('gemb-theme-change', syncTheme);
    };
  }, []);

  const safeVariant = variant === 'icon' ? 'icon' : 'full';
  const source = logoSources[theme]?.[safeVariant] || logoSources.light[safeVariant];

  if (hasError) {
    return (
      <div className={`brand-logo brand-logo-${safeVariant} brand-logo-fallback ${className}`}>
        <span>GEMB</span>
      </div>
    );
  }

  return (
    <img
      className={`brand-logo brand-logo-${safeVariant} ${className}`}
      src={source}
      alt={alt}
      loading="eager"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}
