import { BackButton } from '@/components/ui/back-button';
import { Navbar } from '@/components/layout/Navbar';
import { CashDonationFlow } from '@/components/CashDonationFlow';
import { useAuth } from '@/contexts/AuthContext';

export default function CashDonate() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <BackButton to={user ? "/donor/dashboard" : "/"} className="mb-4" />
        <h1 className="text-3xl font-display font-bold mb-2">Make a Cash Donation</h1>
        <p className="text-muted-foreground mb-8">Support creators with a financial contribution</p>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          <CashDonationFlow />
        </div>
      </div>
    </div>
  );
}
