import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Gift, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Role = 'donor' | 'recipient';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'donor') {
      navigate('/donor/register');
    } else {
      navigate('/recipient/apply');
    }
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

          <h1 className="text-3xl font-display font-bold mb-2">Join the movement</h1>
          <p className="text-muted-foreground mb-8">Create your account to get started</p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                role === 'donor' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
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
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                role === 'recipient' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
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
              <Input 
                id="name" 
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!role}>
              {role === 'donor' ? 'Continue to Donate' : role === 'recipient' ? 'Continue to Apply' : 'Select a role above'}
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
