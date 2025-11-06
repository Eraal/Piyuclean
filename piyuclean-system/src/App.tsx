import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { StudentLayout } from "./components/StudentLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Classrooms from "./pages/Classrooms";
import Tasks from "./pages/Tasks";
import Assignments from "./pages/Assignments";
import Logs from "./pages/Logs";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import StudentHistory from "./pages/StudentHistory";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Default route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Admin routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Layout><Students /></Layout></ProtectedRoute>} />
              <Route path="/classrooms" element={<ProtectedRoute><Layout><Classrooms /></Layout></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
              <Route path="/assignments" element={<ProtectedRoute><Layout><Assignments /></Layout></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute><Layout><Logs /></Layout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
              
              {/* Student routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/dashboard" element={<ProtectedRoute><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
              <Route path="/student/history" element={<ProtectedRoute><StudentLayout><StudentHistory /></StudentLayout></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
