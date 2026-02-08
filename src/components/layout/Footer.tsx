import { Link } from 'react-router-dom';
import { Smartphone, Heart, Mail } from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-primary">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Smartphone className="h-5 w-5" />
              </div>
              <span>A Phone and A Dream</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-md">
              Connecting device donors with digital dreamers across Africa. Together, we're bridging the digital divide one device at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/coming-soon" className="text-muted-foreground hover:text-primary transition-colors">
                  Dream Board
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-muted-foreground hover:text-primary transition-colors">
                  Donate a Device
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-muted-foreground hover:text-primary transition-colors">
                  Apply for a Device
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="lg:col-span-4">
            <h4 className="font-display font-semibold mb-4 text-foreground">Connect</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Follow our journey and stay updated
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://x.com/aphoneandadream" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Follow us on X"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a 
                href="mailto:hello@aphoneandadream.org" 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 A Phone and A Dream. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for dreamers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
