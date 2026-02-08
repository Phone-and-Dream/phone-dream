import { Link } from 'react-router-dom';
import { Smartphone, Heart, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Smartphone className="h-5 w-5" />
              </div>
              <span>A Phone and A Dream</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Connecting device donors with digital dreamers across Africa. Together, we're bridging the digital divide one device at a time.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Dream Board</Link></li>
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Donate a Device</Link></li>
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Apply for a Device</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a 
                href="https://x.com/aphoneandadream" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow us on X"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 A Phone and A Dream. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for dreamers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
