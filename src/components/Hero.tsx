import { Button } from "@/components/ui/button";
import vibeZoneLogo from "@/assets/vibe-zone-logo.png";

export const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-20">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [perspective:1000px] [transform:rotateX(60deg)] opacity-30"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <img 
            src={vibeZoneLogo} 
            alt="Vibe Zone Entertainment - DJ Def Stef specializing in Line Dance and Trail Ride music" 
            className="w-full max-w-md mx-auto mb-8 animate-glow-pulse"
            loading="eager"
          />
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Specializing in <span className="text-neon-cyan font-bold">Line Dance</span> and{" "}
            <span className="text-neon-orange font-bold">Trail Ride</span> songs that keep the party moving
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 glow-neon transition-all hover:scale-105"
            >
              Book DJ Def Stef
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold text-lg px-8 py-6 transition-all hover:scale-105"
            >
              Explore Vibe Que App
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-glow-pulse"></div>
        </div>
      </div>
    </section>
  );
};
