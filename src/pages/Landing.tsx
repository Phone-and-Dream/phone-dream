import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Heart, Users, Gift, Sparkles, Globe, ChevronDown, ChevronUp, Laptop, Tablet, Monitor, Keyboard, HardDrive, Eye, Target, Handshake, BarChart3, Clock, Building2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WaitlistModal } from '@/components/WaitlistModal';

interface AspirationalCard {
  id: string;
  name: string;
  tagline: string;
  location: string;
  status: string;
  icon: LucideIcon;
  gradient: string;
}

const aspirationalCards: AspirationalCard[] = [
  {
    id: 'recipient',
    name: 'Your Name',
    tagline: 'Building a future with the right device',
    location: 'Your City, Your Country',
    status: 'Could receive a phone, laptop, or work device',
    icon: Target,
    gradient: 'from-accent/30 to-accent/10',
  },
  {
    id: 'donor',
    name: 'You, the Donor',
    tagline: 'Helping someone\'s dream move forward',
    location: 'Anywhere in the world',
    status: 'Your donated device can change a life',
    icon: Gift,
    gradient: 'from-primary/30 to-primary/10',
  },
  {
    id: 'organization',
    name: 'Your Organization',
    tagline: 'Empowering talent through shared devices',
    location: 'Global Initiative',
    status: 'Supporting dreams at scale',
    icon: Building2,
    gradient: 'from-blue-500/30 to-blue-400/10',
  },
];

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
}

const stats: StatItem[] = [
  { label: 'Devices Donated', value: 'Starting Soon', icon: Smartphone, subtitle: 'Every device creates opportunity' },
  { label: 'Dreamers Helped', value: 'Your Story', icon: Heart, subtitle: 'The first impact could be yours' },
  { label: 'Countries Reached', value: 'Global Vision', icon: Globe, subtitle: 'Built for anyone, anywhere' },
  { label: 'Active Donors', value: 'Founding Supporters', icon: Users, subtitle: 'Be among the first' },
];

const steps = [
  { step: '01', title: 'Apply or Donate', description: 'Recipients apply with their story. Donors register their devices.', icon: Gift },
  { step: '02', title: 'Get Matched', description: 'Our team verifies applications and matches dreamers with devices.', icon: Heart },
  { step: '03', title: 'Track Impact', description: 'Watch your impact grow as recipients achieve their milestones.', icon: Sparkles },
];

const devices = [
  { name: 'Phones', icon: Smartphone, description: 'Smartphones of all brands' },
  { name: 'Laptops', icon: Laptop, description: 'MacBooks, ThinkPads, etc.' },
  { name: 'Tablets', icon: Tablet, description: 'iPads, Android tablets' },
  { name: 'Desktop PCs', icon: Monitor, description: 'Complete desktop setups' },
  { name: 'Monitors & Peripherals', icon: Keyboard, description: 'Displays, keyboards, mice' },
  { name: 'External Storage', icon: HardDrive, description: 'HDDs, SSDs, USB drives' },
  { name: 'Creator Tools', icon: Sparkles, description: 'Ring lights, mics, webcams, tripods' },
];

const stakeholders = [
  {
    title: 'DONORS',
    color: 'from-primary to-primary/80',
    features: [
      { title: 'GIVE WITH PURPOSE', description: 'Transform your unused devices into powerful tools for education and career growth, directly impacting lives.', icon: Gift },
      { title: 'TRACK YOUR IMPACT', description: 'Experience transparent, verifiable tracking of your device\'s journey and its recipient\'s progress through our blockchain-powered system.', icon: Eye },
    ],
  },
  {
    title: 'RECIPIENTS',
    color: 'from-accent to-accent/80',
    features: [
      { title: 'ACCESS OPPORTUNITY', description: 'Receive a fully refurbished and ready-to-use device, unlocking vital access to digital literacy, online education, and career pathways.', icon: Target },
      { title: 'LAUNCH YOUR DREAM', description: 'Equip yourself with the tools needed to develop new skills, connect with mentors, and launch a thriving tech career.', icon: Sparkles },
    ],
  },
  {
    title: 'PARTNERS',
    color: 'from-blue-600 to-blue-500',
    features: [
      { title: 'AMPLIFY YOUR IMPACT', description: 'Collaborate with APAD to extend your corporate social responsibility efforts and contribute to sustainable digital inclusion on a broader scale.', icon: Handshake },
      { title: 'TRANSPARENT COLLABORATION', description: 'Benefit from verifiable impact metrics and contribute to a scalable model that empowers communities through equitable tech access.', icon: BarChart3 },
    ],
  },
];

export default function Landing() {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden warm-gradient py-20 lg:py-32">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Bridging the Digital Divide
              </div>
              
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-fade-in-up text-foreground">
          Connect Device Donors<br />
          With <span className="text-primary">Digital Dreamers</span>
        </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                A phone can change a life. A laptop can launch a career. Join us in empowering the next generation of creators, developers, and entrepreneurs.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8" asChild>
                  <Link to="/coming-soon">
                    <Gift className="mr-2 h-5 w-5" />
                    Donate a Device
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8" asChild>
                  <Link to="/coming-soon">
                    I Need a Device
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

{/* Waitlist CTA */}
              <div className="mt-10 pt-8 border-t border-border/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <p className="text-lg md:text-xl font-medium text-foreground mb-4">Be the first to know when we launch.</p>
                <Button 
                  size="lg"
                  className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setWaitlistOpen(true)}
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Join the Waitlist
                </Button>
              </div>

              {/* Learn More Button */}
              <button 
                onClick={() => setAboutExpanded(!aboutExpanded)}
                className="mt-6 inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Learn More About Our Mission
                {aboutExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </section>

        {/* About Section - Expandable */}
        {aboutExpanded && (
          <section className="py-16 bg-card border-b border-border animate-fade-in">
            <div className="container">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">JOIN A MOVEMENT</h2>
                <p className="text-xl text-muted-foreground mb-8">BUILT FOR EVERYONE.</p>
                <p className="text-lg text-muted-foreground">
                  A Phone and A Dream connects a diverse ecosystem of individuals and organizations, all united by a vision for equitable digital access and a sustainable future. Discover how you can be part of this impactful journey.
                </p>
              </div>

              {/* Devices You Can Donate */}
              <div className="mb-16">
                <h3 className="text-2xl font-display font-semibold text-center mb-8">Devices You Can Donate</h3>
                <p className="text-center text-muted-foreground mb-6">Used, Refurbished, or New</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {devices.map((device) => (
                    <div key={device.name} className="glass-card rounded-xl p-4 text-center hover:shadow-warm transition-shadow">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <device.icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-semibold">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4 italic">
                  Not limited to these — we accept any functional tech device that can help someone pursue their dreams.
                </p>
              </div>

              {/* Stakeholder Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {stakeholders.map((stakeholder) => (
                  <div key={stakeholder.title} className="glass-card rounded-2xl overflow-hidden">
                    <div className={`bg-gradient-to-r ${stakeholder.color} p-4`}>
                      <h3 className="text-xl font-display font-bold text-white">{stakeholder.title}</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {stakeholder.features.map((feature) => (
                        <div key={feature.title}>
                          <div className="flex items-center gap-2 mb-2">
                            <feature.icon className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-sm">{feature.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center px-2">
                  <div className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2 md:mb-3">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <p className="text-lg md:text-2xl lg:text-3xl font-display font-bold leading-tight">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  {stat.subtitle && (
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2 italic">{stat.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="about" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A simple, transparent process to connect devices with dreamers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="glass-card rounded-2xl p-8 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl font-display font-bold text-primary/20">{item.step}</span>
                      <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                        <item.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Success Stories - Aspirational Placeholder Cards */}
        <section className="py-20 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Success Stories</h2>
              <p className="text-muted-foreground">See the impact of your donations</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {aspirationalCards.map((card) => (
                <div 
                  key={card.id} 
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className={`h-32 bg-gradient-to-br ${card.gradient} relative flex items-center justify-center`}>
                    <div className="h-16 w-16 rounded-2xl bg-background/90 flex items-center justify-center shadow-lg">
                      <card.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg mb-1">
                      {card.name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-2">{card.tagline}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {card.location}
                    </p>
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground italic">
                        {card.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* This could be your story CTA */}
            <div className="text-center mt-10">
              <p className="text-lg text-muted-foreground mb-4">
                <span className="text-foreground font-medium">This could be your story.</span>
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setWaitlistOpen(true)}
                className="font-semibold"
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 hero-gradient text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Whether you have a device to donate or a dream to pursue, join our community today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link to="/coming-soon">Donate a Device</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                <Link to="/coming-soon">Browse Dream Board</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
