import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, studentLogin as apiStudentLogin, type AdminUser, type Student } from '@/lib/api';

type User = AdminUser | (Student & { role: string });

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  studentLogin: (studentId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load from session storage to preserve simple session without backend tokens yet
    const raw = sessionStorage.getItem('ccms_current_user');
    setUser(raw ? JSON.parse(raw) : null);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await apiLogin(username, password);
      setUser(loggedInUser);
      sessionStorage.setItem('ccms_current_user', JSON.stringify(loggedInUser));
      return true;
    } catch {
      return false;
    }
  };

  const studentLogin = async (studentId: string, password: string): Promise<boolean> => {
    try {
      const loggedInStudent = await apiStudentLogin(studentId, password);
      setUser({ ...loggedInStudent, role: 'Student' });
      sessionStorage.setItem('ccms_current_user', JSON.stringify({ ...loggedInStudent, role: 'Student' }));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ccms_current_user');
    setUser(null);
  };

  const isStudent = user && 'studentId' in user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PIYUCLEAN...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, studentLogin, logout, isAuthenticated: !!user, isStudent: !!isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
