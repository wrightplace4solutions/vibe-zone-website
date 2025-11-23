import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Vote,
  Video,
  Play,
  Headphones,
  Briefcase,
  BarChart,
  Music2,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("dj");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("demo_requests")
        .insert([{ email, user_type: userType }]);

      if (error) throw error;

      toast({
        title: "Request Received!",
        description: "We'll send you demo details soon.",
      });
      
      setEmail("");
      setUserType("dj");
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <a href="#demo-video">
                Watch VibeQue Demo
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

      {/* Demo Video Section */}
      <section id="demo-video" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <Video className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See VibeQue in Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Watch how VibeQue transforms any event into an interactive musical experience
            </p>
          </div>
          
          {/* Video Placeholder */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Play className="w-20 h-20 text-primary mb-4 animate-pulse" />
              <p className="text-xl font-semibold text-foreground">Demo Video Coming Soon!</p>
              <p className="text-muted-foreground mt-2">
                We're creating an amazing demo to show you VibeQue in action
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Want to see it live at your event? Request demo access below or book a DJ package today.
          </p>
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

      {/* B2B Benefits - Why DJs & Instructors Love It */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Why DJs & Instructors Love It
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Built for professionals who want to elevate their events
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* For DJs Column */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-center mb-8 text-primary">For DJs</h3>
              
              <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Headphones className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">Stay in Control</h4>
                  <p className="text-muted-foreground">
                    You maintain full creative control while giving guests interaction. Filter requests, set boundaries, manage the vibe.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">Stand Out from Competition</h4>
                  <p className="text-muted-foreground">
                    Offer something competitors don't. Interactive experiences lead to more referrals and higher rates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <BarChart className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">Event Insights</h4>
                  <p className="text-muted-foreground">
                    Track what songs resonate with your crowds. Build better playlists based on real data.
                  </p>
                </div>
              </div>
            </div>

            {/* For Instructors Column */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-center mb-8 text-primary">For Line Dance Instructors</h3>
              
              <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Music2 className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">Keep Your Flow</h4>
                  <p className="text-muted-foreground">
                    Manage song requests during lessons without interrupting your teaching. Students feel heard, you stay on track.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">Perfect for Classes</h4>
                  <p className="text-muted-foreground">
                    Let students request their favorite line dances. See what's popular and plan future lessons accordingly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">No Extra Equipment</h4>
                  <p className="text-muted-foreground">
                    Works on any device. No apps to download, no hardware to set up. Just scan and go.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Request Form */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Want to Try VibeQue at Your Next Event?
            </h2>
            <p className="text-lg text-muted-foreground">
              Get demo access and see how it works for your events
            </p>
          </div>

          <form onSubmit={handleDemoRequest} className="space-y-6 bg-card p-8 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">I am a...</Label>
              <RadioGroup value={userType} onValueChange={setUserType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dj" id="dj" />
                  <Label htmlFor="dj" className="font-normal cursor-pointer">DJ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instructor" id="instructor" />
                  <Label htmlFor="instructor" className="font-normal cursor-pointer">Line Dance Instructor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event_planner" id="event_planner" />
                  <Label htmlFor="event_planner" className="font-normal cursor-pointer">Event Planner</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Get Demo Access"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Or{" "}
              <Link to="/booking" className="text-primary hover:underline font-semibold">
                book DJ Def Stef
              </Link>
              {" "}and get VibeQue included
            </p>
          </form>
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
            Book DJ Def Stef and get VibeQue included at no extra cost. Perfect for weddings, line dance events, and parties.
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
