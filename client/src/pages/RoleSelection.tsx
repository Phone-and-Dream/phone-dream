import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Gift, Star, Loader2, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, isLoading, rolesLoaded, isDonor, isRecipient, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (!isLoading && rolesLoaded) {
      // Admin always goes to admin dashboard
      if (isAdmin) {
        navigate('/admin');
        return;
      }
      
      // Auto-redirect if user has only one role
      if (isDonor && !isRecipient) {
        navigate('/donor/dashboard');
      } else if (isRecipient && !isDonor) {
        navigate('/recipient/dashboard');
      }
      // If both or neither, show selection UI
    }
  }, [isLoading, rolesLoaded, isDonor, isRecipient, isAdmin, user, navigate]);

  if (isLoading || !rolesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  // If neither role, show message
  if (!isDonor && !isRecipient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center max-w-md">
          <Smartphone className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">No Role Assigned</h1>
          <p className="text-muted-foreground mb-6">
            Your account doesn't have any roles yet. Please apply as a recipient or register as a donor to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/recipient/apply')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Apply as Recipient
            </button>
            <button
              onClick={() => navigate('/donor/register')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
            >
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Smartphone className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-primary">A Phone and A Dream</span>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Continue as...</h1>
          <p className="text-muted-foreground">Choose how you'd like to use the platform today</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {isDonor && (
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 group"
              onClick={() => navigate('/donor/dashboard')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Donor</CardTitle>
                <CardDescription>Help others reach their dreams</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                <p>Donate devices, track your impact, and see the lives you've changed.</p>
              </CardContent>
            </Card>
          )}

          {isRecipient && (
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 group"
              onClick={() => navigate('/recipient/dashboard')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Recipient</CardTitle>
                <CardDescription>Pursue your dreams</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                <p>Build your portfolio, track your progress, and showcase your journey.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
