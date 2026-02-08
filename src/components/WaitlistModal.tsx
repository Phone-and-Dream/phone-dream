import { useState, useMemo } from 'react';
import { z } from 'zod';
import { Heart, Gift, ArrowLeft, ArrowRight, Check, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/data/countries';
import {
  donorTypes,
  organizationRoles,
  deviceTypes,
  ageRanges,
  timingOptions,
  deviceCounts,
  currentStatusOptions,
  learningInterests,
  currentDeviceStatusOptions,
} from '@/lib/data/formOptions';
import { useSubmitDonorWaitlist, useSubmitRecipientWaitlist } from '@/hooks/useWaitlist';
import { sanitizeStory } from '@/lib/sanitize';

type WaitlistStep = 'role' | 'donor-form' | 'recipient-form' | 'success';
type WaitlistRole = 'donor' | 'recipient' | null;

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Validation schemas
const donorWaitlistSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email').max(255),
  country: z.string().min(2, 'Please select a country'),
  donor_type: z.enum(['individual', 'company', 'community']),
  organization_name: z.string().optional(),
  organization_role: z.string().optional(),
  devices_interested: z.array(z.string()).min(1, 'Select at least one device type'),
  donation_timing: z.string().optional(),
  estimated_devices: z.string().optional(),
  support_reason: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.donor_type !== 'individual') {
      return data.organization_name && data.organization_name.length > 0;
    }
    return true;
  },
  { message: 'Organization name is required', path: ['organization_name'] }
);

const recipientWaitlistSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email').max(255),
  country: z.string().min(2, 'Please select a country'),
  state: z.string().min(2, 'Please enter your state'),
  age_range: z.enum(['under_18', '18_24', '25_35', '35+']),
  current_status: z.enum(['student', 'unemployed', 'self_learning', 'freelancer', 'early_founder', 'other']),
  current_status_other: z.string().optional(),
  learning_interest: z.enum(['tech', 'content_creation', 'education', 'business', 'other']),
  learning_interest_other: z.string().optional(),
  device_usage_plan: z.string().min(20, 'Please describe how you will use the device (at least 20 characters)').max(1000),
  device_needed: z.array(z.string()).min(1, 'Select at least one device'),
  current_device_status: z.enum(['none', 'broken', 'shared', 'slow']),
});

// Country Select with search
function CountrySelect({ 
  value, 
  onChange, 
  placeholder = 'Select country' 
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    return countries.filter(c =>
      c.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <div className="px-2 pb-2 sticky top-0 bg-popover z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          {filteredCountries.map(country => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
          {filteredCountries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No countries found</p>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}

// Device Checkboxes component
function DeviceCheckboxes({
  selected,
  onChange,
  showDonorOnly = false,
}: {
  selected: string[];
  onChange: (values: string[]) => void;
  showDonorOnly?: boolean;
}) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const visibleDevices = showDonorOnly
    ? deviceTypes
    : deviceTypes.filter(d => !d.donorOnly);

  return (
    <div className="grid grid-cols-2 gap-3">
      {visibleDevices.map(device => (
        <div
          key={device.value}
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
            selected.includes(device.value)
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onClick={() => handleToggle(device.value)}
        >
          <Checkbox
            id={device.value}
            checked={selected.includes(device.value)}
            onCheckedChange={() => handleToggle(device.value)}
          />
          <Label htmlFor={device.value} className="font-normal cursor-pointer text-sm">
            {device.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

// Progress indicator
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            i < current ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [step, setStep] = useState<WaitlistStep>('role');
  const [selectedRole, setSelectedRole] = useState<WaitlistRole>(null);
  
  // Donor form state
  const [donorStep, setDonorStep] = useState(1);
  const [donorData, setDonorData] = useState({
    full_name: '',
    email: '',
    country: '',
    donor_type: '' as string,
    organization_name: '',
    organization_role: '',
    devices_interested: [] as string[],
    donation_timing: '',
    estimated_devices: '',
    support_reason: '',
  });
  const [donorErrors, setDonorErrors] = useState<Record<string, string>>({});

  // Recipient form state
  const [recipientStep, setRecipientStep] = useState(1);
  const [recipientData, setRecipientData] = useState({
    full_name: '',
    email: '',
    country: '',
    state: '',
    age_range: '' as string,
    current_status: '' as string,
    current_status_other: '',
    learning_interest: '' as string,
    learning_interest_other: '',
    device_usage_plan: '',
    device_needed: [] as string[],
    current_device_status: '' as string,
  });
  const [recipientErrors, setRecipientErrors] = useState<Record<string, string>>({});

  const donorMutation = useSubmitDonorWaitlist();
  const recipientMutation = useSubmitRecipientWaitlist();

  const resetForm = () => {
    setStep('role');
    setSelectedRole(null);
    setDonorStep(1);
    setDonorData({
      full_name: '',
      email: '',
      country: '',
      donor_type: '',
      organization_name: '',
      organization_role: '',
      devices_interested: [],
      donation_timing: '',
      estimated_devices: '',
      support_reason: '',
    });
    setDonorErrors({});
    setRecipientStep(1);
    setRecipientData({
      full_name: '',
      email: '',
      country: '',
      state: '',
      age_range: '',
      current_status: '',
      current_status_other: '',
      learning_interest: '',
      learning_interest_other: '',
      device_usage_plan: '',
      device_needed: [],
      current_device_status: '',
    });
    setRecipientErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  const handleRoleSelect = (role: WaitlistRole) => {
    setSelectedRole(role);
    setStep(role === 'donor' ? 'donor-form' : 'recipient-form');
  };

  // Donor form validation per step
  const validateDonorStep = (stepNum: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!donorData.full_name || donorData.full_name.length < 2) {
        errors.full_name = 'Name must be at least 2 characters';
      }
      if (!donorData.email || !z.string().email().safeParse(donorData.email).success) {
        errors.email = 'Please enter a valid email';
      }
      if (!donorData.country) {
        errors.country = 'Please select a country';
      }
    } else if (stepNum === 2) {
      if (!donorData.donor_type) {
        errors.donor_type = 'Please select a donor type';
      }
      if (donorData.donor_type !== 'individual' && !donorData.organization_name) {
        errors.organization_name = 'Organization name is required';
      }
    } else if (stepNum === 3) {
      if (donorData.devices_interested.length === 0) {
        errors.devices_interested = 'Select at least one device type';
      }
    }

    setDonorErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDonorNext = () => {
    if (validateDonorStep(donorStep)) {
      if (donorStep < 5) {
        setDonorStep(donorStep + 1);
      }
    }
  };

  const handleDonorSubmit = async () => {
    const result = donorWaitlistSchema.safeParse(donorData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setDonorErrors(errors);
      return;
    }

    const sanitizedData = {
      ...donorData,
      full_name: sanitizeStory(donorData.full_name),
      organization_name: donorData.organization_name ? sanitizeStory(donorData.organization_name) : undefined,
      support_reason: donorData.support_reason ? sanitizeStory(donorData.support_reason) : undefined,
    };

    await donorMutation.mutateAsync(sanitizedData);
    setStep('success');
  };

  // Recipient form validation per step
  const validateRecipientStep = (stepNum: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!recipientData.full_name || recipientData.full_name.length < 2) {
        errors.full_name = 'Name must be at least 2 characters';
      }
      if (!recipientData.email || !z.string().email().safeParse(recipientData.email).success) {
        errors.email = 'Please enter a valid email';
      }
      if (!recipientData.country) {
        errors.country = 'Please select a country';
      }
      if (!recipientData.state || recipientData.state.length < 2) {
        errors.state = 'Please enter your state';
      }
      if (!recipientData.age_range) {
        errors.age_range = 'Please select your age range';
      }
    } else if (stepNum === 2) {
      if (!recipientData.current_status) {
        errors.current_status = 'Please select your current status';
      }
    } else if (stepNum === 3) {
      if (!recipientData.learning_interest) {
        errors.learning_interest = 'Please select your learning interest';
      }
      if (!recipientData.device_usage_plan || recipientData.device_usage_plan.length < 20) {
        errors.device_usage_plan = 'Please describe how you will use the device (at least 20 characters)';
      }
    } else if (stepNum === 4) {
      if (recipientData.device_needed.length === 0) {
        errors.device_needed = 'Select at least one device';
      }
      if (!recipientData.current_device_status) {
        errors.current_device_status = 'Please select your current device status';
      }
    }

    setRecipientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRecipientNext = () => {
    if (validateRecipientStep(recipientStep)) {
      if (recipientStep < 4) {
        setRecipientStep(recipientStep + 1);
      }
    }
  };

  const handleRecipientSubmit = async () => {
    if (!validateRecipientStep(4)) return;

    const result = recipientWaitlistSchema.safeParse(recipientData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setRecipientErrors(errors);
      return;
    }

    const sanitizedData = {
      ...recipientData,
      full_name: sanitizeStory(recipientData.full_name),
      state: sanitizeStory(recipientData.state),
      current_status_other: recipientData.current_status_other ? sanitizeStory(recipientData.current_status_other) : undefined,
      learning_interest_other: recipientData.learning_interest_other ? sanitizeStory(recipientData.learning_interest_other) : undefined,
      device_usage_plan: sanitizeStory(recipientData.device_usage_plan),
    };

    await recipientMutation.mutateAsync(sanitizedData);
    setStep('success');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Role Selection */}
        {step === 'role' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-center">
                Join the Waitlist
              </DialogTitle>
              <DialogDescription className="text-center">
                A Phone and A Dream | Bridging the Digital Divide
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <p className="text-center text-muted-foreground mb-4">I want to:</p>
              
              <button
                onClick={() => handleRoleSelect('donor')}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Donate a device / Support the mission</p>
                    <p className="text-sm text-muted-foreground">Help bridge the digital divide</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('recipient')}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-accent bg-card hover:bg-accent/5 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Receive a device & pursue my dream</p>
                    <p className="text-sm text-muted-foreground">Take the first step towards your goals</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Donor Form */}
        {step === 'donor-form' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => donorStep === 1 ? setStep('role') : setDonorStep(donorStep - 1)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="text-xl font-display">
                  Donor Waitlist
                </DialogTitle>
              </div>
              <StepProgress current={donorStep} total={5} />
            </DialogHeader>

            <div className="space-y-4">
              {/* Step 1: Basic Info */}
              {donorStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="donor-name">Full Name *</Label>
                    <Input
                      id="donor-name"
                      value={donorData.full_name}
                      onChange={(e) => setDonorData({ ...donorData, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                    {donorErrors.full_name && (
                      <p className="text-sm text-destructive">{donorErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donor-email">Email Address *</Label>
                    <Input
                      id="donor-email"
                      type="email"
                      value={donorData.email}
                      onChange={(e) => setDonorData({ ...donorData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                    {donorErrors.email && (
                      <p className="text-sm text-destructive">{donorErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <CountrySelect
                      value={donorData.country}
                      onChange={(value) => setDonorData({ ...donorData, country: value })}
                    />
                    {donorErrors.country && (
                      <p className="text-sm text-destructive">{donorErrors.country}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Donor Type */}
              {donorStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Donor Type *</Label>
                    <Select
                      value={donorData.donor_type}
                      onValueChange={(value) => setDonorData({ ...donorData, donor_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select donor type" />
                      </SelectTrigger>
                      <SelectContent>
                        {donorTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {donorErrors.donor_type && (
                      <p className="text-sm text-destructive">{donorErrors.donor_type}</p>
                    )}
                  </div>

                  {donorData.donor_type && donorData.donor_type !== 'individual' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name *</Label>
                        <Input
                          id="org-name"
                          value={donorData.organization_name}
                          onChange={(e) => setDonorData({ ...donorData, organization_name: e.target.value })}
                          placeholder="Your organization name"
                        />
                        {donorErrors.organization_name && (
                          <p className="text-sm text-destructive">{donorErrors.organization_name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Role in Organization</Label>
                        <Select
                          value={donorData.organization_role}
                          onValueChange={(value) => setDonorData({ ...donorData, organization_role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationRoles.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Step 3: Devices */}
              {donorStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>What are you interested in donating? *</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                    <DeviceCheckboxes
                      selected={donorData.devices_interested}
                      onChange={(values) => setDonorData({ ...donorData, devices_interested: values })}
                      showDonorOnly
                    />
                    {donorErrors.devices_interested && (
                      <p className="text-sm text-destructive">{donorErrors.devices_interested}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Timing & Volume */}
              {donorStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>When do you think you would donate?</Label>
                    <Select
                      value={donorData.donation_timing}
                      onValueChange={(value) => setDonorData({ ...donorData, donation_timing: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        {timingOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>How many devices (estimated)?</Label>
                    <Select
                      value={donorData.estimated_devices}
                      onValueChange={(value) => setDonorData({ ...donorData, estimated_devices: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceCounts.map(count => (
                          <SelectItem key={count.value} value={count.value}>
                            {count.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Step 5: Support Reason */}
              {donorStep === 5 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="support-reason">Why do you want to support A Phone and A Dream?</Label>
                    <p className="text-sm text-muted-foreground">Optional, but we'd love to hear from you</p>
                    <Textarea
                      id="support-reason"
                      value={donorData.support_reason}
                      onChange={(e) => setDonorData({ ...donorData, support_reason: e.target.value })}
                      placeholder="Share your motivation..."
                      rows={4}
                    />
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {donorStep < 5 ? (
                  <Button onClick={handleDonorNext} className="ml-auto">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleDonorSubmit}
                    disabled={donorMutation.isPending}
                    className="ml-auto"
                  >
                    {donorMutation.isPending ? 'Submitting...' : 'Join the Donor Waitlist'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Recipient Form */}
        {step === 'recipient-form' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => recipientStep === 1 ? setStep('role') : setRecipientStep(recipientStep - 1)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="text-xl font-display">
                  Recipient Waitlist
                </DialogTitle>
              </div>
              <StepProgress current={recipientStep} total={4} />
            </DialogHeader>

            <div className="space-y-4">
              {/* Step 1: Basic Info */}
              {recipientStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Full Name *</Label>
                    <Input
                      id="recipient-name"
                      value={recipientData.full_name}
                      onChange={(e) => setRecipientData({ ...recipientData, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                    {recipientErrors.full_name && (
                      <p className="text-sm text-destructive">{recipientErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-email">Email Address *</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      value={recipientData.email}
                      onChange={(e) => setRecipientData({ ...recipientData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                    {recipientErrors.email && (
                      <p className="text-sm text-destructive">{recipientErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <CountrySelect
                      value={recipientData.country}
                      onChange={(value) => setRecipientData({ ...recipientData, country: value })}
                    />
                    {recipientErrors.country && (
                      <p className="text-sm text-destructive">{recipientErrors.country}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-state">State *</Label>
                    <Input
                      id="recipient-state"
                      value={recipientData.state}
                      onChange={(e) => setRecipientData({ ...recipientData, state: e.target.value })}
                      placeholder="Your state"
                    />
                    {recipientErrors.state && (
                      <p className="text-sm text-destructive">{recipientErrors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Age Range *</Label>
                    <Select
                      value={recipientData.age_range}
                      onValueChange={(value) => setRecipientData({ ...recipientData, age_range: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map(range => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recipientErrors.age_range && (
                      <p className="text-sm text-destructive">{recipientErrors.age_range}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Current Status */}
              {recipientStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>What best describes you right now? *</Label>
                    <Select
                      value={recipientData.current_status}
                      onValueChange={(value) => setRecipientData({ ...recipientData, current_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current status" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentStatusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recipientErrors.current_status && (
                      <p className="text-sm text-destructive">{recipientErrors.current_status}</p>
                    )}
                  </div>

                  {recipientData.current_status === 'other' && (
                    <div className="space-y-2">
                      <Label htmlFor="status-other">Please specify</Label>
                      <Input
                        id="status-other"
                        value={recipientData.current_status_other}
                        onChange={(e) => setRecipientData({ ...recipientData, current_status_other: e.target.value })}
                        placeholder="Describe your current status"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Step 3: Learning Interest */}
              {recipientStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>What do you want to learn or build? *</Label>
                    <Select
                      value={recipientData.learning_interest}
                      onValueChange={(value) => setRecipientData({ ...recipientData, learning_interest: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {learningInterests.map(interest => (
                          <SelectItem key={interest.value} value={interest.value}>
                            {interest.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recipientErrors.learning_interest && (
                      <p className="text-sm text-destructive">{recipientErrors.learning_interest}</p>
                    )}
                  </div>

                  {recipientData.learning_interest === 'other' && (
                    <div className="space-y-2">
                      <Label htmlFor="interest-other">Please specify</Label>
                      <Input
                        id="interest-other"
                        value={recipientData.learning_interest_other}
                        onChange={(e) => setRecipientData({ ...recipientData, learning_interest_other: e.target.value })}
                        placeholder="Describe what you want to learn"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="usage-plan">What would you use the device for specifically? *</Label>
                    <Textarea
                      id="usage-plan"
                      value={recipientData.device_usage_plan}
                      onChange={(e) => setRecipientData({ ...recipientData, device_usage_plan: e.target.value })}
                      placeholder="Describe how you plan to use the device to achieve your goals..."
                      rows={4}
                    />
                    {recipientErrors.device_usage_plan && (
                      <p className="text-sm text-destructive">{recipientErrors.device_usage_plan}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Device Needed */}
              {recipientStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>What device do you need most? *</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                    <DeviceCheckboxes
                      selected={recipientData.device_needed}
                      onChange={(values) => setRecipientData({ ...recipientData, device_needed: values })}
                    />
                    {recipientErrors.device_needed && (
                      <p className="text-sm text-destructive">{recipientErrors.device_needed}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Do you currently own any device? *</Label>
                    <Select
                      value={recipientData.current_device_status}
                      onValueChange={(value) => setRecipientData({ ...recipientData, current_device_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current device status" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentDeviceStatusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recipientErrors.current_device_status && (
                      <p className="text-sm text-destructive">{recipientErrors.current_device_status}</p>
                    )}
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {recipientStep < 4 ? (
                  <Button onClick={handleRecipientNext} className="ml-auto">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleRecipientSubmit}
                    disabled={recipientMutation.isPending}
                    className="ml-auto"
                  >
                    {recipientMutation.isPending ? 'Submitting...' : 'Join the Recipient Waitlist'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Success Screen */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-display mb-2">
              You're on the list!
            </DialogTitle>
            <DialogDescription className="mb-6">
              {selectedRole === 'donor' ? (
                <>
                  Thank you for your interest in donating. You'll be among the first to bring a dream to reality when we launch.
                </>
              ) : (
                <>
                  This is the first step toward turning your dream into reality. We'll be in touch soon with next steps.
                </>
              )}
            </DialogDescription>
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
