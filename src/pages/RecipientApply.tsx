import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Upload, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateApplication, useCreateApplicationReference } from '@/hooks/useApplications';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { countWords } from '@/lib/sanitize';
import type { Database } from '@/integrations/supabase/types';
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
  const { user } = useAuth();
  const createApplication = useCreateApplication();
  const createReference = useCreateApplicationReference();
  const updateProfile = useUpdateProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validReferencesCount = useMemo(() => {
    return references.filter(r => 
      r.name.trim() && r.relationship.trim() && r.contact.trim()
    ).length;
  }, [references]);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          name.trim().length >= 2 &&
          isValidEmail(email) &&
          location.trim() &&
          country &&
          creatorType &&
          (creatorType !== 'other' || otherCreatorType.trim())
        );
      case 2:
        const wordCount = countWords(purpose);
        return !!(
          schoolOrCareer &&
          deviceNeeded &&
          (deviceNeeded !== 'other' || otherDeviceNeeded.trim()) &&
          wordCount >= 150 && wordCount <= 500
        );
      case 3:
        return validReferencesCount >= 2;
      case 4:
        return true; // Optional step
      case 5:
        return isStepValid(1) && isStepValid(2) && isStepValid(3);
      default:
        return false;
    }
  };

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

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user profile with form data
      await updateProfile.mutateAsync({
        full_name: name,
        location: location,
        country: country,
      });

      // Map creator type to valid enum value
      const validCreatorTypes: Database['public']['Enums']['creator_type'][] = ['student', 'artist', 'entrepreneur', 'developer', 'educator', 'other'];
      let mappedCreatorType: Database['public']['Enums']['creator_type'] = 'other';
      
      if (creatorType === 'content-creator') {
        mappedCreatorType = 'other';
      } else if (creatorType === 'designer') {
        mappedCreatorType = 'artist';
      } else if (validCreatorTypes.includes(creatorType as any)) {
        mappedCreatorType = creatorType as Database['public']['Enums']['creator_type'];
      }

      // Upsert recipient profile
      const { error: profileError } = await supabase
        .from('recipient_profiles')
        .upsert({
          user_id: user.id,
          creator_type: mappedCreatorType,
          school_or_career: schoolOrCareer,
          institution: institution || null,
        }, {
          onConflict: 'user_id',
        });

      if (profileError) throw profileError;

      // Create application
      const application = await createApplication.mutateAsync({
        device_needed: deviceNeeded === 'other' ? otherDeviceNeeded : deviceNeeded,
        purpose: purpose,
      });

      // Create references
      const validRefs = references.filter(r => r.name.trim() && r.relationship.trim() && r.contact.trim());
      for (const ref of validRefs) {
        await createReference.mutateAsync({
          application_id: application.id,
          name: ref.name,
          relationship: ref.relationship,
          contact: ref.contact,
        });
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully.",
      });

      navigate('/recipient/apply/success');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  Full Name *
                  {name.trim().length >= 2 && <Check className="h-4 w-4 text-accent" />}
                </Label>
                <Input 
                  id="name" 
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {name && name.trim().length < 2 && (
                  <p className="text-xs text-destructive">Name must be at least 2 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email *
                  {isValidEmail(email) && <Check className="h-4 w-4 text-accent" />}
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {email && !isValidEmail(email) && (
                  <p className="text-xs text-destructive">Please enter a valid email</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  State *
                  {location.trim() && <Check className="h-4 w-4 text-accent" />}
                </Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Lagos State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  Country *
                  {country && <Check className="h-4 w-4 text-accent" />}
                </Label>
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
              <Label htmlFor="creatorType" className="flex items-center gap-2">
                What type of creator are you? *
                {creatorType && (creatorType !== 'other' || otherCreatorType.trim()) && <Check className="h-4 w-4 text-accent" />}
              </Label>
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
                {!otherCreatorType.trim() && (
                  <p className="text-xs text-destructive">Please specify your creator type</p>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolOrCareer" className="flex items-center gap-2">
                  School or Career Status *
                  {schoolOrCareer && <Check className="h-4 w-4 text-accent" />}
                </Label>
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
              <Label htmlFor="deviceNeeded" className="flex items-center gap-2">
                What device do you need? *
                {deviceNeeded && (deviceNeeded !== 'other' || otherDeviceNeeded.trim()) && <Check className="h-4 w-4 text-accent" />}
              </Label>
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
                {!otherDeviceNeeded.trim() && (
                  <p className="text-xs text-destructive">Please specify the device</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-2">
                Tell us your story and why you need this device *
                {countWords(purpose) >= 150 && countWords(purpose) <= 500 && <Check className="h-4 w-4 text-accent" />}
              </Label>
              <Textarea 
                id="purpose"
                placeholder="Share your dreams, goals, and how a device would help you achieve them. The more detailed your story, the better your chances of receiving a device..."
                className="min-h-[200px]"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
              <div className="flex justify-between text-xs">
                <p className={cn(
                  countWords(purpose) >= 150 && countWords(purpose) <= 500 ? "text-accent" : "text-muted-foreground"
                )}>
                  {countWords(purpose)}/150 words minimum (max 500)
                  {countWords(purpose) < 150 && ` (${150 - countWords(purpose)} more needed)`}
                  {countWords(purpose) > 500 && <span className="text-destructive ml-1">({countWords(purpose) - 500} too many)</span>}
                </p>
                <p className="text-muted-foreground italic">The more detailed, the better your chances!</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Please provide 2-3 references who can vouch for your application.
              </p>
              <span className={cn(
                "text-sm font-medium px-2 py-1 rounded",
                validReferencesCount >= 2 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              )}>
                {validReferencesCount}/2 complete
              </span>
            </div>
            {references.map((ref, index) => {
              const isComplete = ref.name.trim() && ref.relationship.trim() && ref.contact.trim();
              return (
                <div key={index} className={cn(
                  "p-4 border rounded-xl space-y-4",
                  isComplete ? "border-accent/50 bg-accent/5" : "border-border"
                )}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      Reference {index + 1}
                      {isComplete && <Check className="h-4 w-4 text-accent" />}
                    </h4>
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
              );
            })}
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
            {!letterUploaded && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  While optional, uploading a reference letter significantly increases your chances of approval.
                </p>
              </div>
            )}
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
                  <dd className="font-medium capitalize">{creatorType === 'other' ? otherCreatorType : creatorType || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Device Needed</dt>
                  <dd className="font-medium capitalize">{deviceNeeded === 'other' ? otherDeviceNeeded : deviceNeeded || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">References</dt>
                  <dd className="font-medium">{validReferencesCount} provided</dd>
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
        <BackButton to={user ? "/recipient/dashboard" : "/"} className="mb-4" />
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
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid(currentStep)}
            >
              {!isStepValid(currentStep) ? 'Complete required fields' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid(5) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
