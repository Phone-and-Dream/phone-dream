import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RankBadge } from '@/components/ui/rank-badge';
import { DonationModal } from '@/components/DonationModal';
import { mockDreamRequests, formatDate, DreamRequest } from '@/lib/mockData';

export default function DreamBoard() {
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<DreamRequest | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const filteredRequests = mockDreamRequests.filter(req => {
    const matchesSearch = req.recipientName.toLowerCase().includes(search.toLowerCase()) || req.purpose.toLowerCase().includes(search.toLowerCase());
    const matchesDevice = deviceFilter === 'all' || req.deviceNeeded.toLowerCase() === deviceFilter;
    return matchesSearch && matchesDevice;
  });

  const handleDonateClick = (request: DreamRequest) => {
    setSelectedRequest(request);
    setIsDonationModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Dream Board</h1>
          <p className="text-muted-foreground">Browse device requests from verified dreamers</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or purpose..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-full md:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="laptop">Laptop</SelectItem>
              <SelectItem value="smartphone">Smartphone</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="pc">PC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="glass-card rounded-2xl p-6 hover:shadow-warm transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <img src={request.recipientAvatar} alt={request.recipientName} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{request.recipientName}</h3>
                  <p className="text-sm text-muted-foreground">{request.creatorType} • {request.region}</p>
                  <RankBadge rank={request.xpRank} size="sm" className="mt-1" />
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Needs</p>
                <p className="font-semibold text-primary">{request.deviceNeeded}</p>
                {request.needsRefurbishing && (
                  <p className="text-xs text-amber-600 mt-0.5">✨ Open to refurbished</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{request.purpose}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">{formatDate(request.datePosted)}</span>
                <Button size="sm" onClick={() => handleDonateClick(request)}>
                  <Heart className="h-4 w-4 mr-1" /> Donate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />

      {/* Donation Modal */}
      <DonationModal 
        request={selectedRequest} 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
    </div>
  );
}
