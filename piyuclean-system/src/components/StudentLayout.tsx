import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, ClipboardList, History } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-500 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  PIYUCLEAN Student Portal
                </h1>
                <p className="text-sm text-emerald-50/90">Classroom Cleaning Management & Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <p className="text-sm text-emerald-50">Welcome,</p>
                <p className="font-semibold text-white">{user?.fullName || 'Student'}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex gap-2 py-3">
            <NavLink
              to="/student/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <ClipboardList className="h-4 w-4" />
              My Tasks
            </NavLink>
            <NavLink
              to="/student/history"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <History className="h-4 w-4" />
              My Completion History
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          © 2025 PIYUCLEAN - Classroom Cleaning Management System
        </div>
      </footer>
    </div>
  );
};

