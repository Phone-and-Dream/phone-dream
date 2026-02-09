import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Eye, EyeOff, Loader2, Gift, Star } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type LoginRole = 'donor' | 'recipient';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, user, rolesLoaded, isDonor, isRecipient, isAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('recipient');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Wait for roles to load after successful login, then navigate
  useEffect(() => {
    if (loginSuccess && user && rolesLoaded) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isDonor && isRecipient) {
        navigate('/select-role', { replace: true });
      } else if (isDonor) {
        navigate('/donor/dashboard', { replace: true });
      } else if (isRecipient) {
        navigate('/recipient/dashboard', { replace: true });
      } else {
        // User has no roles, navigate based on selection
        if (selectedRole === 'donor') {
          navigate('/donor/dashboard', { replace: true });
        } else {
          navigate('/recipient/dashboard', { replace: true });
        }
      }
    }
  }, [loginSuccess, user, rolesLoaded, isDonor, isRecipient, isAdmin, selectedRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    });

    // Set flag to trigger navigation after roles load
    setLoginSuccess(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <BackButton to="/" label="Back to Home" className="mb-6" />
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Smartphone className="h-5 w-5" />
            </div>
            <span>A Phone and A Dream</span>
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-6">Sign in to continue your journey</p>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Sign in as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('recipient')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  selectedRole === 'recipient'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  selectedRole === 'recipient' ? "bg-primary/10" : "bg-muted"
                )}>
                  <Star className={cn(
                    "h-5 w-5",
                    selectedRole === 'recipient' ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  selectedRole === 'recipient' ? "text-primary" : "text-muted-foreground"
                )}>Recipient</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('donor')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  selectedRole === 'donor'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  selectedRole === 'donor' ? "bg-primary/10" : "bg-muted"
                )}>
                  <Gift className={cn(
                    "h-5 w-5",
                    selectedRole === 'donor' ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  selectedRole === 'donor' ? "text-primary" : "text-muted-foreground"
                )}>Donor</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
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
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign In as ${selectedRole === 'donor' ? 'Donor' : 'Recipient'}`
              )}
            </Button>
          </form>

          <div className="flex justify-end mt-4">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-display font-bold mb-4">
            Your dream is just a device away
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of dreamers and donors making a difference across Africa.
          </p>
        </div>
      </div>
    </div>
  );
}
