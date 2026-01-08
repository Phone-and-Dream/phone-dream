import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Prototype password - In production, use proper authentication
const DEMO_ADMIN_PASSWORD = 'admin123';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (password === DEMO_ADMIN_PASSWORD) {
        // Store admin session in sessionStorage (prototype only)
        sessionStorage.setItem('adminAuthenticated', 'true');
        toast({
          title: "Welcome, Admin!",
          description: "You've successfully logged into the admin panel.",
        });
        navigate('/admin');
      } else {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Smartphone className="h-5 w-5" />
            </div>
            <span>A Phone and A Dream</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Admin Access</h1>
              <p className="text-muted-foreground">Enter password to continue</p>
            </div>
          </div>

          {/* Prototype Warning */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 my-6 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary">Prototype Mode</p>
              <p className="text-muted-foreground">
                This is a demo login. Use password: <code className="bg-muted px-1 rounded">admin123</code>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link to="/" className="text-primary hover:underline font-medium">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="h-24 w-24 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Admin Control Center
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage applications, donations, and platform analytics from a unified dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
