import React, { createContext, ReactNode, useContext, useState } from 'react';
import {setAuthToken} from "../services/api/api";

interface User {
  userId: string;
  userNm: string;
  userRoleType: string; // '001': 운영업체, '002': 휴게소, '004': 주유소
  apiKey: string;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setAuthToken(userData.apiKey);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
