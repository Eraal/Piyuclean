import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, UserPlus } from 'lucide-react';
import { createStudent } from '@/lib/api';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    classSection: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
      });
      setLoading(false);
      return;
    }

    try {
      await createStudent({
        studentId: formData.studentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        classSection: formData.classSection,
        status: 'active',
        password: formData.password,
      });

      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully!',
      });

      // Navigate to student login
      navigate('/student/login');
    } catch (err) {
      let message = 'An error occurred during registration. Please try again.';
      if (err && typeof err === 'object') {
        const maybeMsg = (err as { message?: unknown }).message;
        if (typeof maybeMsg === 'string') {
        try {
            const parsed = JSON.parse(maybeMsg);
            if (parsed?.message) message = parsed.message;
        } catch (_ignored) {
          // leave default message
        }
        }
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: message,
      });
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <UserPlus className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            Create Student Account
          </CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600">
            Join PIYUCLEAN Student Portal
          </CardDescription>
          <p className="text-sm text-emerald-600 mt-1 font-medium">Register to access your cleaning tasks</p>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-gray-700 font-medium">Student ID</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="Enter your student ID"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                required
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classSection" className="text-gray-700 font-medium">Class/Section</Label>
              <Select
                value={formData.classSection}
                onValueChange={(value) => handleInputChange('classSection', value)}
              >
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="Select your class/section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BSIT 1A">BSIT 1A</SelectItem>
                  <SelectItem value="BSIT 1B">BSIT 1B</SelectItem>
                  <SelectItem value="BSIT 1C">BSIT 1C</SelectItem>
                  <SelectItem value="BSIT 1D">BSIT 1D</SelectItem>
                  <SelectItem value="BSIT 2A">BSIT 2A</SelectItem>
                  <SelectItem value="BSIT 2B">BSIT 2B</SelectItem>
                  <SelectItem value="BSIT 2C">BSIT 2C</SelectItem>
                  <SelectItem value="BSIT 2D">BSIT 2D</SelectItem>
                  <SelectItem value="BSIT 3A AMG">BSIT 3A AMG</SelectItem>
                  <SelectItem value="BSIT 3B AMG">BSIT 3B AMG</SelectItem>
                  <SelectItem value="BSIT 3C WMAD">BSIT 3C WMAD</SelectItem>
                  <SelectItem value="BSIT 3D NETAD">BSIT 3D NETAD</SelectItem>
                  <SelectItem value="BSIT 4A AMG">BSIT 4A AMG</SelectItem>
                  <SelectItem value="BSIT 4B AMG">BSIT 4B AMG</SelectItem>
                  <SelectItem value="BSIT 4C WMAD">BSIT 4C WMAD</SelectItem>
                  <SelectItem value="BSIT 4D NETAD">BSIT 4D NETAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] h-11"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Already have an account?
            </p>
            <Link 
              to="/student/login" 
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
            >
              Sign in to your account →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegister;
