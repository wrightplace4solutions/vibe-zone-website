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
    <section className="py-10 md:py-12 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left side - Content */}
          <div className="animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              <span className="text-neon-cyan">Vibe Que</span>
              <br />
              <span className="text-neon-orange">Interactive DJ App</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Revolutionize your event with our cutting-edge interactive DJ app. 
              Guests can request songs, vote on tracks, and stay connected with the music all night long.
            </p>
            
            <div className="space-y-2 mb-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-2 md:p-3 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-primary/50 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base mb-0.5 text-foreground">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs md:text-sm px-4 py-3 transition-all hover:scale-105"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Explore VibeQue App
                </a>
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                className="font-bold text-xs md:text-sm px-4 py-3 transition-all hover:scale-105"
                asChild
              >
                <Link to="/vibeque">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side - Visual */}
          <div className="relative animate-fade-in hidden md:block" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-square max-w-[200px] mx-auto">
              {/* Phone mockup placeholder with glow effect */}
              <div className="absolute inset-0 bg-gradient-neon rounded-2xl opacity-20 blur-2xl animate-glow-pulse"></div>
              <div className="relative bg-card border-2 border-primary/50 rounded-2xl p-4 glow-neon">
                <div className="space-y-2">
                  <div className="h-6 bg-primary/20 rounded-lg animate-glow-pulse"></div>
                  <div className="h-16 bg-accent/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "0.5s" }}></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-primary/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "1s" }}></div>
                    <div className="h-10 bg-accent/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "1.5s" }}></div>
                  </div>
                  <div className="h-8 bg-primary/20 rounded-lg animate-glow-pulse" style={{ animationDelay: "2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
