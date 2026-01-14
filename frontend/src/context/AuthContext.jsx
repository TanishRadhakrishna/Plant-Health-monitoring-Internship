// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import authAPI from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const hasValidToken = authAPI.isAuthenticated();

        if (hasValidToken) {
          // Try to get latest profile from server to ensure accuracy
          try {
            const profile = await authAPI.getProfile();
            if (profile) {
              setUser(profile);
              localStorage.setItem('user', JSON.stringify(profile));
              setIsAuthenticated(true);
            }
          } catch (err) {
            // Profile fetch failed, try refresh token flow
            try {
              await authAPI.refreshToken();
              const profile2 = await authAPI.getProfile();
              if (profile2) {
                setUser(profile2);
                localStorage.setItem('user', JSON.stringify(profile2));
                setIsAuthenticated(true);
              }
            } catch (error) {
              // Refresh failed - clear everything
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          // No valid token - try to refresh to recover session
          try {
            await authAPI.refreshToken();
            const profile = await authAPI.getProfile();
            if (profile) {
              setUser(profile);
              localStorage.setItem('user', JSON.stringify(profile));
              setIsAuthenticated(true);
            }
          } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      // Fetch fresh profile to ensure we have server-side data
      try {
        const profile = await authAPI.getProfile();
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } else if (response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (err) {
        // Fallback to response.user
        if (response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // After registration, automatically log in
      await login({ email: userData.email, password: userData.password });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    logoutAll,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};