import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await authService.getMe();
        return res?.data?.user || null;
      } catch (err) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });

  const user = data || null;

  const loginMutation = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], res.data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], res.data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  const value = {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: Boolean(user),
    isUser: user?.role === 'USER',
    isOrganizer: user?.role === 'ORGANIZER',
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};