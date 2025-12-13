import { Button } from "@/components/ui/button";
import vibeZoneLogo from "@/assets/vibe-zone-logo.png";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px] [perspective:1000px] [transform:rotateX(60deg)] opacity-30"></div>
      
      {/* Glowing orbs - smaller */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <img 
            src={vibeZoneLogo} 
            alt="Vibe Zone Entertainment - DJ Def Stef specializing in Line Dance and Trail Ride music" 
            className="w-full max-w-[200px] md:max-w-[250px] mx-auto mb-4 animate-glow-pulse" 
            loading="eager" 
          />
          
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto px-2">
            Specializing in <span className="text-neon-cyan font-bold">Line Dance</span> and{" "}
            <span className="text-neon-orange font-bold">Trailride</span> songs that keep the party moving
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              asChild
              size="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 py-4 glow-neon transition-all hover:scale-105"
            >
              <Link to="/booking">Book DJ Def Stef</Link>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold text-sm px-6 py-4 transition-all hover:scale-105"
            >
              <Link to="/vibeque">Explore Vibe Que App</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-4 h-6 border-2 border-primary rounded-full flex items-start justify-center p-1">
          <div className="w-0.5 h-2 bg-primary rounded-full animate-glow-pulse"></div>
        </div>
      </div>
    </section>
  );
};