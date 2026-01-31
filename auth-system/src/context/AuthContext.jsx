import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;
  const derivedRole = userData.role ?? userData.userType ?? null;
  return { ...userData, role: derivedRole };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { permissions: globalPermissions, users } = useData();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = useCallback((username, password) => {
    // 验证用户凭据
    const foundUser = users?.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const normalized = normalizeUser(foundUser);
      localStorage.setItem('user', JSON.stringify(normalized));
      setUser(normalized);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const hasPermission = useCallback((requiredPermission) => {
    if (!requiredPermission) return true;
    if (!user || !user.role) return false;
    
    // 超级管理员默认拥有所有权限
    if (user.role === '超级管理员') return true;
    
    const rolePermissions = globalPermissions[user.role] || [];
    
    // 检查用户是否拥有所需的权限
    return rolePermissions.includes(requiredPermission);
  }, [user, globalPermissions]);

  const isAuthenticated = !!user;
  const value = { user, isAuthenticated, login, logout, hasPermission };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
