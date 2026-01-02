import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';

export default function DonorRegister() {
  const navigate = useNavigate();
  const [needsRefurbishing, setNeedsRefurbishing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/donor/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-2">Donate a Device</h1>
        <p className="text-muted-foreground mb-8">Your device can change someone's life</p>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Name / Organization *</Label>
              <Input placeholder="Name or organization" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location *</Label>
            <Input placeholder="City, Country" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Device Type *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select device" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="pc">Desktop PC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used - Good Condition</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium">Does it need refurbishing?</p>
              <p className="text-sm text-muted-foreground">If yes, you can contribute to repair costs</p>
            </div>
            <Switch checked={needsRefurbishing} onCheckedChange={setNeedsRefurbishing} />
          </div>

          {needsRefurbishing && (
            <div className="space-y-2">
              <Label>Repair Contribution (USD)</Label>
              <Input type="number" placeholder="50" />
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">Submit Donation</Button>
        </form>
      </div>
    </div>
  );
}
