import { Link } from 'react-router-dom';
import { Gift, DollarSign, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function DonorDonateChoice() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-3xl">
        <BackButton to={user ? "/donor/dashboard" : "/"} className="mb-4" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Make a Donation</h1>
          <p className="text-muted-foreground">Choose how you'd like to support dreamers today</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Physical Device Card */}
          <Card className="group hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer">
            <Link to="/donor/register" className="block h-full">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Gift className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Donate a Device</CardTitle>
                <CardDescription>Give your unused device a new purpose</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0">✓</span>
                    Laptops, phones, tablets & more
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0">✓</span>
                    Choose your recipient or let us match
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0">✓</span>
                    Earn an on-chain Impact Badge (SBT)
                  </li>
                </ul>
                <Button className="w-full group-hover:bg-primary/90">
                  Donate Device
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Cash Donation Card */}
          <Card className="group hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer">
            <Link to="/donor/cash-donate" className="block h-full">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Donate Cash</CardTitle>
                <CardDescription>Fund device purchases & repairs</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-accent/50 flex items-center justify-center text-xs text-primary flex-shrink-0">✓</span>
                    Flexible amounts starting from $10
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-accent/50 flex items-center justify-center text-xs text-primary flex-shrink-0">✓</span>
                    Support specific dreams or the platform
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-accent/50 flex items-center justify-center text-xs text-primary flex-shrink-0">✓</span>
                    Help cover shipping & refurbishing
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary">
                  Donate Cash
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Every contribution, big or small, helps bridge the digital divide and empowers creators across Africa.
        </p>
      </div>
    </div>
  );
}
