import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

export type CashDonation = Database['public']['Tables']['cash_donations']['Row'];

// Fetch current user's cash donations
export function useMyCashDonations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my_cash_donations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('cash_donations')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CashDonation[];
    },
    enabled: !!user?.id,
  });
}

// Fetch all cash donations (admin view)
export function useAllCashDonations() {
  return useQuery({
    queryKey: ['all_cash_donations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_donations')
        .select(`
          *,
          donor:profiles!cash_donations_donor_id_fkey(id, full_name, email, avatar_url),
          recipient:profiles!cash_donations_linked_recipient_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Calculate total cash donated by user
export function useMyTotalCashDonated() {
  const { data: cashDonations = [] } = useMyCashDonations();
  
  const total = cashDonations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
  
  return total;
}

// Get monthly aggregated data for charts
export function useCashDonationsMonthlyData() {
  const { data: cashDonations = [], isLoading } = useAllCashDonations();

  const monthlyData = cashDonations.reduce((acc: Record<string, number>, donation) => {
    if (donation.status !== 'completed') return acc;
    
    const date = new Date(donation.created_at);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    acc[monthKey] = (acc[monthKey] || 0) + donation.amount;
    return acc;
  }, {});

  // Convert to array format for recharts
  const chartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-6); // Last 6 months

  return { data: chartData, isLoading };
}
