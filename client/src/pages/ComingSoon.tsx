import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WaitlistModal } from '@/components/WaitlistModal';

export default function ComingSoon() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <section className="relative overflow-hidden w-full">
          <div className="container relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 text-primary mb-8 animate-fade-in">
                <Rocket className="h-10 w-10" />
              </div>
              
              {/* Heading */}
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 animate-fade-in-up text-foreground">
                Coming Soon
              </h1>
              
              {/* Subheading */}
              <p className="text-xl md:text-2xl text-primary font-medium mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                We're building something amazing
              </p>
              
              {/* Description */}
              <p className="text-lg text-muted-foreground mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                A Phone and A Dream is launching soon! Join our waitlist to be the first to know when we go live and start making an impact.
              </p>
              
              {/* Waitlist CTA */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Button 
                  size="lg"
                  className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setWaitlistOpen(true)}
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Join the Waitlist
                </Button>
              </div>
              
              {/* Social Links */}
              <div className="mt-12 pt-8 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <p className="text-muted-foreground mb-4">Follow us on X for updates</p>
                <a 
                  href="https://x.com/aphoneandadream" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  @aphoneandadream
                </a>
              </div>
              
              {/* Back Link */}
              <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </section>
      </main>

      <Footer />
      
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
