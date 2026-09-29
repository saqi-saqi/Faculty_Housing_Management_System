import { create } from 'zustand';
import { User, Faculty } from '../types/index.js';

interface AuthState {
  user: User | null;
  faculty: Faculty | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, faculty: Faculty | null) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('fhms_auth_token');
  const savedUser = localStorage.getItem('fhms_auth_user');
  const savedFaculty = localStorage.getItem('fhms_auth_faculty');

  let initialUser: User | null = null;
  let initialFaculty: Faculty | null = null;

  try {
    if (savedUser) initialUser = JSON.parse(savedUser);
    if (savedFaculty) initialFaculty = JSON.parse(savedFaculty);
  } catch (e) {
    console.error('Failed to parse saved auth data', e);
  }

  return {
    user: initialUser,
    faculty: initialFaculty,
    token: savedToken,
    isAuthenticated: !!savedToken && !!initialUser,
    isLoading: false,

    login: (token, user, faculty) => {
      localStorage.setItem('fhms_auth_token', token);
      localStorage.setItem('fhms_auth_user', JSON.stringify(user));
      if (faculty) {
        localStorage.setItem('fhms_auth_faculty', JSON.stringify(faculty));
      } else {
        localStorage.removeItem('fhms_auth_faculty');
      }
      set({ token, user, faculty, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
      localStorage.removeItem('fhms_auth_token');
      localStorage.removeItem('fhms_auth_user');
      localStorage.removeItem('fhms_auth_faculty');
      set({ token: null, user: null, faculty: null, isAuthenticated: false, isLoading: false });
    },

    updateUser: (partialUser) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, ...partialUser };
        localStorage.setItem('fhms_auth_user', JSON.stringify(updated));
        return { user: updated };
      });
    },

    setLoading: (loading) => set({ isLoading: loading })
  };
});

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (localStorage.getItem('fhms_theme') as Theme) || 'system';

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  applyTheme(savedTheme);

  return {
    theme: savedTheme,
    setTheme: (theme) => {
      localStorage.setItem('fhms_theme', theme);
      applyTheme(theme);
      set({ theme });
    }
  };
});

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open })
}));
