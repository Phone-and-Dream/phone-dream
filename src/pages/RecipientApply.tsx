import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Background' },
  { id: 3, title: 'References' },
  { id: 4, title: 'Upload Letter' },
  { id: 5, title: 'Review' },
];

interface Reference {
  name: string;
  relationship: string;
  contact: string;
}

export default function RecipientApply() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [creatorType, setCreatorType] = useState('');
  const [otherCreatorType, setOtherCreatorType] = useState('');
  const [schoolOrCareer, setSchoolOrCareer] = useState('');
  const [institution, setInstitution] = useState('');
  const [purpose, setPurpose] = useState('');
  const [deviceNeeded, setDeviceNeeded] = useState('');
  const [otherDeviceNeeded, setOtherDeviceNeeded] = useState('');
  const [references, setReferences] = useState<Reference[]>([
    { name: '', relationship: '', contact: '' },
    { name: '', relationship: '', contact: '' }
  ]);
  const [letterUploaded, setLetterUploaded] = useState(false);

  const addReference = () => {
    if (references.length < 3) {
      setReferences([...references, { name: '', relationship: '', contact: '' }]);
    }
  };

  const removeReference = (index: number) => {
    if (references.length > 2) {
      setReferences(references.filter((_, i) => i !== index));
    }
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  const handleSubmit = () => {
    // Demo: navigate to confirmation
    navigate('/recipient/apply/success');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">City/Town *</Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Lagos"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="south-africa">South Africa</SelectItem>
                    <SelectItem value="egypt">Egypt</SelectItem>
                    <SelectItem value="morocco">Morocco</SelectItem>
                    <SelectItem value="senegal">Senegal</SelectItem>
                    <SelectItem value="tanzania">Tanzania</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="creatorType">What type of creator are you? *</Label>
              <Select value={creatorType} onValueChange={setCreatorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your creator type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="content-creator">Content Creator</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {creatorType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherCreatorType">Please specify your creator type *</Label>
                <Input 
                  id="otherCreatorType" 
                  placeholder="e.g., Researcher, Artist, Journalist"
                  value={otherCreatorType}
                  onChange={(e) => setOtherCreatorType(e.target.value)}
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolOrCareer">School or Career Status *</Label>
                <Select value={schoolOrCareer} onValueChange={setSchoolOrCareer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Currently a Student</SelectItem>
                    <SelectItem value="graduate">Recent Graduate</SelectItem>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="unemployed">Seeking Opportunities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution/Company (if applicable)</Label>
                <Input 
                  id="institution" 
                  placeholder="e.g., University of Lagos"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceNeeded">What device do you need? *</Label>
              <Select value={deviceNeeded} onValueChange={setDeviceNeeded}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="pc">Desktop PC</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {deviceNeeded === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherDeviceNeeded">Please specify the device you need *</Label>
                <Input 
                  id="otherDeviceNeeded" 
                  placeholder="e.g., Drawing Tablet, Monitor, VR Headset"
                  value={otherDeviceNeeded}
                  onChange={(e) => setOtherDeviceNeeded(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="purpose">Tell us your story and why you need this device *</Label>
              <Textarea 
                id="purpose"
                placeholder="Share your dreams, goals, and how a device would help you achieve them..."
                className="min-h-[150px]"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum 100 characters. Be specific about your goals and how you'll use the device.</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Please provide 2-3 references who can vouch for your application.
            </p>
            {references.map((ref, index) => (
              <div key={index} className="p-4 border border-border rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Reference {index + 1}</h4>
                  {references.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeReference(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input 
                      placeholder="Reference name"
                      value={ref.name}
                      onChange={(e) => updateReference(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship *</Label>
                    <Input 
                      placeholder="e.g., Lecturer, Mentor"
                      value={ref.relationship}
                      onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact (Email/Phone) *</Label>
                    <Input 
                      placeholder="Email or phone"
                      value={ref.contact}
                      onChange={(e) => updateReference(index, 'contact', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {references.length < 3 && (
              <Button variant="outline" onClick={addReference} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Reference
              </Button>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Please upload a reference letter from one of your references. This helps us verify your application.
            </p>
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                letterUploaded ? "border-accent bg-accent/5" : "border-border hover:border-primary/50"
              )}
              onClick={() => setLetterUploaded(true)}
            >
              {letterUploaded ? (
                <>
                  <Check className="h-12 w-12 mx-auto text-accent mb-4" />
                  <p className="font-medium">reference_letter.pdf uploaded</p>
                  <p className="text-sm text-muted-foreground mt-1">Click to replace</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                </>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">Review Your Application</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{name || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{email || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium">{location}, {country || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Creator Type</dt>
                  <dd className="font-medium capitalize">{creatorType || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Device Needed</dt>
                  <dd className="font-medium capitalize">{deviceNeeded || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">References</dt>
                  <dd className="font-medium">{references.filter(r => r.name).length} provided</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reference Letter</dt>
                  <dd className="font-medium">{letterUploaded ? 'Uploaded' : 'Not uploaded'}</dd>
                </div>
              </dl>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm">
                By submitting this application, you confirm that all information provided is accurate. 
                Our team will review your application within 5-7 business days.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Apply for a Device</h1>
          <p className="text-muted-foreground">Tell us about yourself and your dreams</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors",
                  currentStep > step.id 
                    ? "bg-accent text-accent-foreground" 
                    : currentStep === step.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "hidden sm:block w-12 lg:w-24 h-1 mx-2",
                    currentStep > step.id ? "bg-accent" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.id} className="hidden sm:block text-xs text-muted-foreground">
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-display font-semibold mb-6">
            {steps.find(s => s.id === currentStep)?.title}
          </h2>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
