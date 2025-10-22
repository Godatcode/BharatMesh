/**
 * Auth Store - Zustand state management for authentication
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@bharatmesh/shared';
import { authApi } from '@services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phone: string, pin: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(phone, pin);
          
          if (response.success && response.data) {
            const { user, tokens } = response.data;
            
            // Store tokens
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            
            set({
              user,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error?.message || 'Login failed');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        });
      },

      updateUser: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateProfile(updates);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false
            });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Update failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      initialize: async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          try {
            const response = await authApi.getProfile();
            
            if (response.success && response.data) {
              set({
                user: response.data,
                accessToken,
                refreshToken,
                isAuthenticated: true
              });
            } else {
              get().logout();
            }
          } catch (error) {
            console.log('Auth initialization failed, clearing tokens:', error);
            get().logout();
          }
        }
      },

      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

