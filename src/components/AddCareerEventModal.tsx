import { useState, useRef } from 'react';
import { Upload, X, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CareerEvent } from './CareerEventCard';

interface AddCareerEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: CareerEvent) => void;
}

export function AddCareerEventModal({ isOpen, onClose, onAdd }: AddCareerEventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<CareerEvent['category']>('Conference');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!name || !date || !location || !description) {
      alert('Please fill in all required fields');
      return;
    }

    const newEvent: CareerEvent = {
      id: `ce-${Date.now()}`,
      name,
      date,
      location,
      category,
      description,
      image: imagePreview || undefined,
      skillsGained: skills.split(',').map(s => s.trim()).filter(Boolean),
    };

    onAdd(newEvent);
    
    // Reset form
    setName('');
    setDate('');
    setLocation('');
    setCategory('Conference');
    setDescription('');
    setSkills('');
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Career Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Event Photo</Label>
            <div 
              className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="h-8 w-8 mb-2" />
                  <p className="text-sm">Click to upload event photo</p>
                  <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input
              id="event-name"
              placeholder="e.g., Lagos Tech Summit 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Date and Location Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="event-location"
                  placeholder="City or Virtual"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as CareerEvent['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Hackathon">Hackathon</SelectItem>
                <SelectItem value="Meetup">Meetup</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description">Description *</Label>
            <Textarea
              id="event-description"
              placeholder="What did you learn or achieve at this event?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Skills Gained */}
          <div className="space-y-2">
            <Label htmlFor="skills">Skills Gained (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="e.g., Networking, React, Leadership"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Add Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
