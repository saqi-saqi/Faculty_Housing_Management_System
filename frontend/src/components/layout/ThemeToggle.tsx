import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../../lib/store.js';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
      title={`Current theme: ${theme}. Click to toggle.`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
      {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
      {theme === 'system' && <Laptop className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}
