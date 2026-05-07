import { create } from 'zustand';
import { AuthResponse } from '../types';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  login: (data) => {
    const normalized = { ...data, role: normalizeRole(data.role) };
    localStorage.setItem('enova_token', data.token);
    localStorage.setItem('enova_user', JSON.stringify(normalized));
    set({ user: normalized, isAuthenticated: true, isHydrated: true });
  },
  logout: () => {
    localStorage.removeItem('enova_token');
    localStorage.removeItem('enova_user');
    set({ user: null, isAuthenticated: false, isHydrated: true });
  },
  loadFromStorage: () => {
    const stored = localStorage.getItem('enova_user');
    const token = localStorage.getItem('enova_token');
    if (stored && token) {
      const parsed = JSON.parse(stored);
      set({ user: { ...parsed, role: normalizeRole(parsed.role) }, isAuthenticated: true, isHydrated: true });
      return;
    }
    set({ user: null, isAuthenticated: false, isHydrated: true });
  },
}));

function normalizeRole(role?: string) {
  if (!role) return role;
  return role.toUpperCase().replace('ROLE_', '');
}
