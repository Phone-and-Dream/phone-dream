import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, TrendingUp, Filter, MapPin, Crown, Star } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RankBadge } from '@/components/ui/rank-badge';
import { mockRecipients, Recipient } from '@/lib/mockData';

// Extend mock data for leaderboard
const extendedRecipients: Recipient[] = [
  ...mockRecipients,
  // Add more mock entries for the leaderboard
  {
    ...mockRecipients[0],
    id: '4',
    name: 'Kofi Asante',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    tagline: 'Full Stack Developer',
    creatorType: 'Developer',
    location: 'Kumasi',
    country: 'Ghana',
    xp: 2100,
    rank: 'Silver',
    leaderboardPosition: 4,
  },
  {
    ...mockRecipients[0],
    id: '5',
    name: 'Zainab Ibrahim',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    tagline: 'Content Creator',
    creatorType: 'Content Creator',
    location: 'Abuja',
    country: 'Nigeria',
    xp: 1950,
    rank: 'Silver',
    leaderboardPosition: 5,
  },
  {
    ...mockRecipients[0],
    id: '6',
    name: 'Samuel Otieno',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    tagline: 'Mobile App Developer',
    creatorType: 'Developer',
    location: 'Kampala',
    country: 'Uganda',
    xp: 1800,
    rank: 'Silver',
    leaderboardPosition: 6,
  },
  {
    ...mockRecipients[0],
    id: '7',
    name: 'Grace Adeyemi',
    avatar: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=200&h=200&fit=crop',
    tagline: 'Digital Artist',
    creatorType: 'Designer',
    location: 'Ibadan',
    country: 'Nigeria',
    xp: 1650,
    rank: 'Bronze',
    leaderboardPosition: 7,
  },
] as Recipient[];

const regions = [
  { value: 'all', label: 'All Regions' },
  { value: 'west-africa', label: 'West Africa' },
  { value: 'east-africa', label: 'East Africa' },
  { value: 'north-africa', label: 'North Africa' },
  { value: 'southern-africa', label: 'Southern Africa' },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Developer', label: 'Developers' },
  { value: 'Designer', label: 'Designers' },
  { value: 'Entrepreneur', label: 'Entrepreneurs' },
  { value: 'Content Creator', label: 'Content Creators' },
  { value: 'Student', label: 'Students' },
];

const timePeriods = [
  { value: 'all-time', label: 'All Time' },
  { value: 'this-month', label: 'This Month' },
  { value: 'this-week', label: 'This Week' },
];

const getRegion = (country: string): string => {
  const westAfrica = ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Mali'];
  const eastAfrica = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia'];
  const northAfrica = ['Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Libya'];
  const southernAfrica = ['South Africa', 'Zimbabwe', 'Botswana', 'Zambia', 'Namibia'];
  
  if (westAfrica.includes(country)) return 'west-africa';
  if (eastAfrica.includes(country)) return 'east-africa';
  if (northAfrica.includes(country)) return 'north-africa';
  if (southernAfrica.includes(country)) return 'southern-africa';
  return 'other';
};

const getMedalIcon = (position: number) => {
  if (position === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
  if (position === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (position === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
};

export default function Leaderboard() {
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all-time');

  // Sort by XP and apply filters
  const sortedRecipients = [...extendedRecipients]
    .sort((a, b) => b.xp - a.xp)
    .filter(recipient => {
      const matchesRegion = regionFilter === 'all' || getRegion(recipient.country) === regionFilter;
      const matchesCategory = categoryFilter === 'all' || recipient.creatorType === categoryFilter;
      return matchesRegion && matchesCategory;
    })
    .map((recipient, index) => ({ ...recipient, leaderboardPosition: index + 1 }));

  const topThree = sortedRecipients.slice(0, 3);
  const remaining = sortedRecipients.slice(3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="warm-gradient py-12 border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Trophy className="h-4 w-4" />
                Top Dreamers
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                XP Leaderboard
              </h1>
              <p className="text-muted-foreground">
                Celebrating the most active and impactful recipients in our community
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 bg-card border-b border-border">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timePeriods.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Top 3 Podium */}
        <section className="py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-12">
              {/* 2nd Place */}
              {topThree[1] && (
                <Link 
                  to={`/recipient/profile/${topThree[1].id}`}
                  className="order-2 md:order-1 glass-card rounded-2xl p-6 text-center hover:shadow-warm transition-all w-full md:w-56"
                >
                  <div className="flex justify-center mb-3">
                    {getMedalIcon(2)}
                  </div>
                  <img 
                    src={topThree[1].avatar} 
                    alt={topThree[1].name}
                    className="w-16 h-16 rounded-xl mx-auto object-cover mb-3 border-2 border-gray-300"
                  />
                  <h3 className="font-semibold truncate">{topThree[1].name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{topThree[1].creatorType}</p>
                  <RankBadge rank={topThree[1].rank} size="sm" className="mt-2" />
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-2xl font-bold text-primary">{topThree[1].xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP Points</p>
                  </div>
                </Link>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <Link 
                  to={`/recipient/profile/${topThree[0].id}`}
                  className="order-1 md:order-2 glass-card rounded-2xl p-6 text-center hover:shadow-warm transition-all w-full md:w-64 md:-mb-4 ring-2 ring-primary/30 bg-gradient-to-br from-primary/5 to-accent/5"
                >
                  <div className="flex justify-center mb-3">
                    {getMedalIcon(1)}
                  </div>
                  <img 
                    src={topThree[0].avatar} 
                    alt={topThree[0].name}
                    className="w-20 h-20 rounded-xl mx-auto object-cover mb-3 border-2 border-yellow-400 shadow-lg"
                  />
                  <h3 className="font-semibold text-lg truncate">{topThree[0].name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{topThree[0].creatorType}</p>
                  <RankBadge rank={topThree[0].rank} size="sm" className="mt-2" />
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-3xl font-bold text-primary">{topThree[0].xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP Points</p>
                  </div>
                </Link>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <Link 
                  to={`/recipient/profile/${topThree[2].id}`}
                  className="order-3 glass-card rounded-2xl p-6 text-center hover:shadow-warm transition-all w-full md:w-56"
                >
                  <div className="flex justify-center mb-3">
                    {getMedalIcon(3)}
                  </div>
                  <img 
                    src={topThree[2].avatar} 
                    alt={topThree[2].name}
                    className="w-16 h-16 rounded-xl mx-auto object-cover mb-3 border-2 border-amber-600"
                  />
                  <h3 className="font-semibold truncate">{topThree[2].name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{topThree[2].creatorType}</p>
                  <RankBadge rank={topThree[2].rank} size="sm" className="mt-2" />
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-2xl font-bold text-primary">{topThree[2].xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP Points</p>
                  </div>
                </Link>
              )}
            </div>

            {/* Remaining Rankings */}
            <div className="max-w-3xl mx-auto space-y-3">
              {remaining.map((recipient) => (
                <Link
                  key={recipient.id}
                  to={`/recipient/profile/${recipient.id}`}
                  className="flex items-center gap-4 glass-card rounded-xl p-4 hover:shadow-warm transition-all"
                >
                  <div className="w-10 text-center">
                    {getMedalIcon(recipient.leaderboardPosition)}
                  </div>
                  <img 
                    src={recipient.avatar} 
                    alt={recipient.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{recipient.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{recipient.creatorType}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {recipient.country}
                      </span>
                    </div>
                  </div>
                  <RankBadge rank={recipient.rank} size="sm" showLabel={false} />
                  <div className="text-right">
                    <p className="font-bold text-primary">{recipient.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </Link>
              ))}
            </div>

            {sortedRecipients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recipients found matching your filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
