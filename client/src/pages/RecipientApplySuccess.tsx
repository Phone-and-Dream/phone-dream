import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function RecipientApplySuccess() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-20 max-w-lg text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-4 animate-fade-in">
          Application Submitted!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Thank you for applying. Our team will review your application within 5-7 business days. 
          You'll receive an email notification once a decision has been made.
        </p>

        <div className="glass-card rounded-xl p-6 text-left mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold mb-3">What happens next?</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">1.</span>
              Our team reviews your application and references
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">2.</span>
              If approved, your request appears on the Dream Board
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">3.</span>
              A donor matches with you and we coordinate delivery
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">4.</span>
              You receive your device and start building your dream!
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {user && (
            <Button asChild>
              <Link to="/recipient/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button variant={user ? "outline" : "default"} asChild>
            <Link to="/dream-board">
              Explore Dream Board
              {!user && <ArrowRight className="ml-2 h-4 w-4" />}
            </Link>
          </Button>
          {!user && (
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
