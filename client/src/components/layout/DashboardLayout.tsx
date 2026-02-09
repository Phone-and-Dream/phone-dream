import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  LayoutDashboard, 
  FileEdit, 
  Heart, 
  Settings, 
  LogOut,
  Users,
  Gift,
  BarChart3,
  Trophy,
  ChevronLeft,
  ClipboardList,
  User,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'recipient' | 'donor' | 'admin';
}

const recipientLinks = [
  { name: 'My Portfolio', href: '/recipient/dashboard', icon: LayoutDashboard },
  { name: 'Earn XP', href: '/recipient/tasks', icon: Trophy },
  { name: 'Dream Board', href: '/dream-board', icon: Heart },
  { name: 'Settings', href: '/recipient/settings', icon: Settings },
];

const donorLinks = [
  { name: 'Dashboard', href: '/donor/dashboard', icon: LayoutDashboard },
  { name: 'Donate', href: '/donor/donate', icon: Gift },
  { name: 'Dream Board', href: '/dream-board', icon: Heart },
  { name: 'Settings', href: '/donor/settings', icon: Settings },
];

const adminLinks = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Applications', href: '/admin?tab=applications', icon: FileEdit },
  { name: 'Donations', href: '/admin?tab=donations', icon: Gift },
  { name: 'Users', href: '/admin?tab=users', icon: Users },
  { name: 'Analytics', href: '/admin?tab=analytics', icon: BarChart3 },
  { name: 'XP Management', href: '/admin?tab=xp', icon: Trophy },
];

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  // Build recipient links dynamically to include user ID for public profile
  const dynamicRecipientLinks = [
    { name: 'My Portfolio', href: '/recipient/dashboard', icon: LayoutDashboard },
    { name: 'Earn XP', href: '/recipient/tasks', icon: Trophy },
    { name: 'Leaderboard', href: '/leaderboard', icon: Crown },
    { name: 'Public Profile', href: user?.id ? `/recipient/profile/${user.id}` : '/recipient/dashboard', icon: User },
    { name: 'Dream Board', href: '/dream-board', icon: Heart },
    { name: 'Settings', href: '/recipient/settings', icon: Settings },
  ];
  
  const links = role === 'recipient' ? dynamicRecipientLinks : role === 'donor' ? donorLinks : adminLinks;

  const roleLabels = {
    recipient: 'Recipient Portal',
    donor: 'Donor Portal',
    admin: 'Admin Dashboard'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">{roleLabels[role]}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.href || 
                (link.href.includes('?') && location.pathname + location.search === link.href);
              
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
          <nav className="flex justify-around p-2">
            {links.slice(0, 4).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 text-xs",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
