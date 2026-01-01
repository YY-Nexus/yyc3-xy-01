/**
 * @file useAuth.tsx
 * @description YYC³ AI小语智能成长守护系统认证Hook，提供用户认证、登录、注册等功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';
import { reportError } from '@/lib/global-error-handler';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'parent' | 'admin' | 'moderator';
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        if (token) {
          // Verify token and get user profile
          const profileResult = await apiClient.getProfile();

          if (profileResult.success && profileResult.data) {
            setAuthState({
              user: profileResult.data.user,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            });
          } else {
            // Token invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        reportError(error as Error, { component: 'useAuth', action: 'initializeAuth' });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await apiClient.login(email, password);

      if (result.success && result.data) {
        const { user, tokens } = result.data;

        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        return true;
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: result.error || '登录失败',
        });

        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录时发生错误';

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });

      return false;
    }
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await apiClient.register(userData);

      if (result.success && result.data) {
        const { user, tokens } = result.data;

        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        return true;
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: result.error || '注册失败',
        });

        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册时发生错误';

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });

      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await apiClient.logout(refreshToken);
      }
    } catch (error) {
      reportError(error as Error, { component: 'useAuth', action: 'logout' });
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  };

  // Update profile function
  const updateProfile = async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await apiClient.updateProfile(profileData);

      if (result.success && result.data) {
        setAuthState(prev => ({
          ...prev,
          user: result.data.user,
          isLoading: false,
          error: null,
        }));

        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || '更新资料失败',
        }));

        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新资料时发生错误';

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return false;
    }
  };

  // Refresh profile function
  const refreshProfile = async (): Promise<void> => {
    if (!authState.isAuthenticated) return;

    try {
      const result = await apiClient.getProfile();

      if (result.success && result.data) {
        setAuthState(prev => ({
          ...prev,
          user: result.data.user,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      reportError(error as Error, { component: 'useAuth', action: 'refreshProfile' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Hook to get current user
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

// Hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Hook to get auth loading state
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

// Hook to get auth error
export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}

// Hook to check user role
export function useUserRole(): string | null {
  const user = useUser();
  return user?.role || null;
}

// Hook to check if user is admin
export function useIsAdmin(): boolean {
  const role = useUserRole();
  return role === 'admin';
}

// Hook to check if user is parent
export function useIsParent(): boolean {
  const role = useUserRole();
  return role === 'parent';
}

// Hook to get user display name
export function useUserDisplayName(): string {
  const user = useUser();
  if (!user) return '';

  return user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.email || '';
}

// Export original interface for backward compatibility
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  error: string | null;
}

// Backward compatibility wrapper
export function useAuthLegacy(): UseAuthReturn {
  const auth = useAuth();

  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    signUp: async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
      return auth.register({ email, password, firstName: firstName || '', lastName: lastName || '', phone });
    },
    signIn: auth.login,
    signOut: auth.logout,
    updateProfile: auth.updateProfile,
    error: auth.error,
  };
}

export default AuthProvider;
