import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Heart, Users, CheckCircle, Gift, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { mockRecipients, mockDonors, mockDreamRequests } from '@/lib/mockData';

const stats = [
  { label: 'Devices Donated', value: '1,247', icon: Smartphone },
  { label: 'Dreamers Helped', value: '1,156', icon: Heart },
  { label: 'Countries Reached', value: '23', icon: Globe },
  { label: 'Active Donors', value: '342', icon: Users },
];

const steps = [
  { step: '01', title: 'Apply or Donate', description: 'Recipients apply with their story. Donors register their devices.', icon: Gift },
  { step: '02', title: 'Get Matched', description: 'Our team verifies applications and matches dreamers with devices.', icon: Heart },
  { step: '03', title: 'Track Impact', description: 'Watch your impact grow as recipients achieve their milestones.', icon: Sparkles },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden warm-gradient py-20 lg:py-32">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Bridging the Digital Divide
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-fade-in-up">
                Connect Device Donors with{' '}
                <span className="text-primary">Digital Dreamers</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                A phone can change a life. A laptop can launch a career. Join us in empowering the next generation of African creators, developers, and entrepreneurs.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8" asChild>
                  <Link to="/donor/register">
                    <Gift className="mr-2 h-5 w-5" />
                    Donate a Device
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8" asChild>
                  <Link to="/recipient/apply">
                    I Need a Device
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl md:text-4xl font-display font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
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

        {/* Featured Success Stories */}
        <section className="py-20 bg-card">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Success Stories</h2>
                <p className="text-muted-foreground">See the impact of your donations</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/dream-board">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mockRecipients.slice(0, 3).map((recipient) => (
                <Link 
                  key={recipient.id} 
                  to={`/recipient/profile/${recipient.id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:shadow-warm transition-shadow"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    <img 
                      src={recipient.avatar} 
                      alt={recipient.name}
                      className="absolute -bottom-8 left-6 w-20 h-20 rounded-xl object-cover border-4 border-card shadow-lg"
                    />
                  </div>
                  <div className="p-6 pt-12">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display font-semibold group-hover:text-primary transition-colors">
                          {recipient.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{recipient.tagline}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {recipient.rank}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {recipient.location}, {recipient.country}
                    </p>
                    {recipient.deviceReceived && (
                      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">Received {recipient.deviceReceived.type}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
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
                <Link to="/donor/register">Donate a Device</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                <Link to="/dream-board">Browse Dream Board</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
