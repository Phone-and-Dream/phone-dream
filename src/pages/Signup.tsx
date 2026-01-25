import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Gift, Heart, Loader2, Check, X } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Role = 'donor' | 'recipient';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = isValidEmail(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = role && isNameValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields correctly and select a role.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, name, role);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created!",
      description: "Please complete your profile.",
    });

    // Navigate to dashboard - they can start onboarding from there
    if (role === 'donor') {
      navigate('/donor/dashboard');
    } else {
      navigate('/recipient/dashboard');
    }
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

          <h1 className="text-3xl font-display font-bold mb-2">Join the movement</h1>
          <p className="text-muted-foreground mb-8">Create your account to get started</p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('donor')}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                role === 'donor' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center",
                role === 'donor' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Gift className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-semibold">I want to donate</p>
                <p className="text-xs text-muted-foreground">Give a device</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('recipient')}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                role === 'recipient' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center",
                role === 'recipient' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Heart className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-semibold">I need a device</p>
                <p className="text-xs text-muted-foreground">Apply for one</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  placeholder="Your name (min 2 characters)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className={cn(name && (isNameValid ? "border-accent" : "border-destructive"))}
                />
                {name && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isNameValid ? <Check className="h-4 w-4 text-accent" /> : <X className="h-4 w-4 text-destructive" />}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={cn(email && (isEmailValid ? "border-accent" : "border-destructive"))}
                />
                {email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isEmailValid ? <Check className="h-4 w-4 text-accent" /> : <X className="h-4 w-4 text-destructive" />}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <PasswordInput 
                  id="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={cn(password && (isPasswordValid ? "border-accent" : "border-destructive"))}
                />
                {password && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2">
                    {isPasswordValid ? <Check className="h-4 w-4 text-accent" /> : <X className="h-4 w-4 text-destructive" />}
                  </span>
                )}
              </div>
              <p className={cn("text-xs", password && !isPasswordValid ? "text-destructive" : "text-muted-foreground")}>
                Must be at least 6 characters {password && `(${password.length}/6)`}
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!isFormValid || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : !role ? (
                'Select a role above'
              ) : !isFormValid ? (
                'Complete all fields'
              ) : (
                role === 'donor' ? 'Continue to Donate' : 'Continue to Apply'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-display font-bold mb-4">
            Be part of something bigger
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Every device donated creates ripples of opportunity across communities.
          </p>
        </div>
      </div>
    </div>
  );
}
