import { Button } from "@/components/ui/button";
import { Smartphone, Users, ListMusic, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Smartphone,
    title: "Mobile-Friendly",
    description: "Request songs from your phone in real-time",
  },
  {
    icon: Users,
    title: "Crowd-Powered",
    description: "Let your guests vote on the next track",
  },
  {
    icon: ListMusic,
    title: "Live Playlist",
    description: "See what's playing and what's coming up",
  },
  {
    icon: ThumbsUp,
    title: "Easy Requests",
    description: "Simple interface for quick song requests",
  },
];

export const VibeQueShowcase = () => {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-bold mb-6">
              <span className="text-neon-cyan">Vibe Que</span>
              <br />
              <span className="text-neon-orange">Interactive DJ App</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Revolutionize your event with our cutting-edge interactive DJ app. 
              Guests can request songs, vote on tracks, and stay connected with the music all night long.
            </p>
            
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-primary/50 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 transition-all hover:scale-105"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Explore VibeQue App
                </a>
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="font-bold text-lg px-8 py-6 transition-all hover:scale-105"
                asChild
              >
                <Link to="/vibeque">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side - Visual */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Phone mockup placeholder with glow effect */}
              <div className="absolute inset-0 bg-gradient-neon rounded-3xl opacity-20 blur-3xl animate-glow-pulse"></div>
              <div className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 glow-neon">
                <div className="space-y-4">
                  <div className="h-12 bg-primary/20 rounded-lg animate-glow-pulse"></div>
                  <div className="h-32 bg-accent/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "0.5s" }}></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-primary/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "1s" }}></div>
                    <div className="h-20 bg-accent/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "1.5s" }}></div>
                  </div>
                  <div className="h-16 bg-primary/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
