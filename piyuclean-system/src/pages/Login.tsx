import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { School } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(username, password);
    
    if (success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      navigate('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-emerald-100 relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <School className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            PIYUCLEAN
          </CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600">
            Classroom Cleaning Management System
          </CardDescription>
          <p className="text-sm text-emerald-600 mt-1 font-medium">Sign in to access the dashboard</p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] h-11" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-xs text-center text-gray-500 mt-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <span className="font-medium">Default credentials:</span> admin / admin123
            </div>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <a href="/student/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Are you a student? Login here →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
