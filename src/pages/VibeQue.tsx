import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Users, 
  ListMusic, 
  ThumbsUp, 
  Zap, 
  Music, 
  Heart,
  TrendingUp,
  Clock,
  Vote
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Smartphone,
    title: "Real-Time Song Requests",
    description: "Guests scan a QR code and instantly request their favorite songs from their phones—no app download required."
  },
  {
    icon: Vote,
    title: "Live Voting System",
    description: "Let the crowd decide! Guests vote on requested songs, creating a democratic and interactive playlist."
  },
  {
    icon: ListMusic,
    title: "Live Playlist View",
    description: "Everyone can see what's playing now and what's coming up next, building anticipation throughout the event."
  },
  {
    icon: ThumbsUp,
    title: "Quick & Easy Interface",
    description: "Intuitive design means even your least tech-savvy guests can participate without confusion."
  },
  {
    icon: Zap,
    title: "Instant Engagement",
    description: "Keep energy high as guests actively participate in shaping the musical experience."
  },
  {
    icon: Clock,
    title: "Queue Management",
    description: "Smart queue system ensures variety and prevents the same songs from dominating the night."
  }
];

const benefits = [
  {
    icon: Heart,
    title: "Guest Satisfaction",
    description: "When guests hear their requested songs, they feel heard and valued, creating memorable moments."
  },
  {
    icon: TrendingUp,
    title: "Higher Energy Levels",
    description: "Interactive engagement keeps guests on the dance floor longer and more enthusiastic."
  },
  {
    icon: Users,
    title: "Crowd Connection",
    description: "Creates a shared experience as guests collaborate on the perfect playlist together."
  },
  {
    icon: Music,
    title: "Musical Variety",
    description: "Discover what resonates with your crowd in real-time and adapt the vibe accordingly."
  }
];

const VibeQue = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        
        <div className="container mx-auto relative z-10 max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="text-neon-cyan">Vibe Que</span>
            <br />
            <span className="text-neon-orange">Transform Your Event</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            The interactive DJ app that turns passive listeners into active participants
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                Explore the App
              </a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="font-bold text-lg px-8 py-6"
              asChild
            >
              <Link to="/booking">Book Your Event</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Simple, powerful, and designed for maximum engagement
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="border-border hover:border-primary/50 transition-all animate-fade-in bg-card/80 backdrop-blur"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Why Your Event Needs This
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Create unforgettable experiences that guests will talk about for weeks
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="flex gap-6 p-6 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/10"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Elevate Your Next Event?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            VibeQue comes included with every VZ Entertainment DJ package
          </p>
          
          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6"
            asChild
          >
            <Link to="/booking">Book Your DJ Package</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default VibeQue;
