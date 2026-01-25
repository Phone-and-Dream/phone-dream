import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { CashDonation } from '@/hooks/useCashDonations';

const applicationTrendData = [
  { month: 'Jul', applications: 8 },
  { month: 'Aug', applications: 12 },
  { month: 'Sep', applications: 15 },
  { month: 'Oct', applications: 10 },
  { month: 'Nov', applications: 18 },
  { month: 'Dec', applications: 14 },
];

const donationsByRegionData = [
  { region: 'West Africa', donations: 32 },
  { region: 'East Africa', donations: 28 },
  { region: 'North Africa', donations: 12 },
  { region: 'Southern Africa', donations: 8 },
  { region: 'Central Africa', donations: 5 },
];

const deviceTypeData = [
  { name: 'Laptops', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Smartphones', value: 25, color: 'hsl(var(--info))' },
  { name: 'Tablets', value: 20, color: 'hsl(var(--success))' },
  { name: 'Other', value: 10, color: 'hsl(var(--warning))' },
];

const xpGrowthData = [
  { month: 'Jul', avgXP: 850 },
  { month: 'Aug', avgXP: 1100 },
  { month: 'Sep', avgXP: 1350 },
  { month: 'Oct', avgXP: 1600 },
  { month: 'Nov', avgXP: 1900 },
  { month: 'Dec', avgXP: 2150 },
];

export function ApplicationTrendChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Applications Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={applicationTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonationsByRegionChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Donations by Region</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={donationsByRegionData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis dataKey="region" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="donations" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeviceTypeChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Device Types Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={deviceTypeData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {deviceTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function XPGrowthChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Average XP Growth</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={xpGrowthData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="avgXP"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CashDonationsTrendChartProps {
  data: CashDonation[];
}

export function CashDonationsTrendChart({ data }: CashDonationsTrendChartProps) {
  const chartData = useMemo(() => {
    // Group by month
    const monthlyData: Record<string, number> = {};
    
    data.forEach(donation => {
      if (donation.status !== 'completed') return;
      const date = new Date(donation.created_at);
      const monthKey = format(date, 'MMM');
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + donation.amount;
    });

    // Convert to array and take last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      last6Months.push({
        month: monthName,
        amount: monthlyData[monthName] || 0,
      });
    }

    return last6Months;
  }, [data]);

  const totalCash = data
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Cash Donations Over Time</h3>
        <span className="text-2xl font-bold text-primary">${totalCash.toLocaleString()}</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            fill="url(#cashGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
