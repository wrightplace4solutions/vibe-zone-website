import { Button } from "@/components/ui/button";
import vibeZoneLogo from "@/assets/vibe-zone-logo.png";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-[72vh] md:min-h-[76vh] flex items-center overflow-hidden bg-gradient-hero pt-16 pb-8 md:pb-10">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px] [perspective:1000px] [transform:rotateX(60deg)] opacity-30"></div>
      
      {/* Controlled ambient accents */}
      <div className="absolute top-24 left-10 w-40 h-40 md:w-56 md:h-56 bg-primary/12 rounded-full blur-2xl animate-float-soft"></div>
      <div className="absolute bottom-16 right-8 w-44 h-44 md:w-64 md:h-64 bg-accent/12 rounded-full blur-2xl animate-float-soft" style={{ animationDelay: "1s" }}></div>
      
      <div className="relative z-10 container mx-auto px-5 md:px-6 animate-fade-in">
        <div className="grid items-center gap-8 md:gap-10 lg:gap-14 md:grid-cols-2">
          <div className="text-center md:text-left max-w-2xl">
            <h1 className="text-[2.1rem] leading-[1.12] sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 md:mb-5 text-balance">
              <span className="text-neon-cyan">More Than Music.</span>{" "}
              <span className="text-foreground">It&apos;s A Vibe.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-7 md:mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed text-balance">
              Line Dance • Trail Ride • Weddings • Corporate Events • Interactive Crowd Experience
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start items-stretch sm:items-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm md:text-base px-7 py-6 glow-neon transition-all hover:scale-[1.02]"
              >
                <Link to="/booking">Book DJ Def Stef</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-accent/70 text-accent hover:bg-accent hover:text-accent-foreground font-bold text-sm md:text-base px-7 py-6 transition-all hover:scale-[1.02]"
              >
                <Link to="/vibeque">Explore Vibe Que App</Link>
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mt-2 md:mt-0">
            <div className="absolute w-[240px] h-[240px] md:w-[340px] md:h-[340px] bg-primary/13 rounded-full blur-2xl animate-pulse-soft"></div>
            <div className="relative w-[250px] h-[250px] md:w-[330px] md:h-[330px] rounded-full border border-primary/35 bg-card/45 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_hsl(var(--primary)/0.18)]">
              <div className="absolute inset-3 rounded-full border border-accent/20"></div>
              <img
                src={vibeZoneLogo}
                alt="Vibe Zone Entertainment glowing emblem"
                className="w-[72%] max-w-[240px] animate-float-soft"
                loading="eager"
              />
              <div className="absolute -top-3 right-3 text-[10px] md:text-xs uppercase tracking-[0.25em] text-primary/85 bg-background/70 border border-primary/30 px-2 py-1 rounded-full">
                Nightlife Energy
              </div>
              <div className="absolute -bottom-3 left-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-accent/90 bg-background/70 border border-accent/30 px-2 py-1 rounded-full">
                Premium Events
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block animate-scroll-nudge">
        <div className="w-4 h-6 border-2 border-primary rounded-full flex items-start justify-center p-1">
          <div className="w-0.5 h-2 bg-primary rounded-full animate-pulse-soft"></div>
        </div>
      </div>
    </section>
  );
};