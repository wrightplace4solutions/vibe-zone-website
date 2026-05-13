import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EVENT_IMAGE_URL =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80";

export const EventEnergySection = () => {
  return (
    <section className="py-14 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 min-h-[420px] md:min-h-[500px] group">
          <img
            src={EVENT_IMAGE_URL}
            alt="Live crowd energy at a premium music event"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/35"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.18),transparent_55%)]"></div>

          <div className="relative z-10 h-full flex items-end">
            <div className="max-w-2xl p-6 md:p-10 lg:p-12">
              <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-primary/90 mb-3">
                Real Event Energy
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-4">
                Music That Moves People.
                <span className="text-neon-orange"> Moments They Never Forget.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-6">
                Creating unforgettable experiences through music, energy, and crowd connection.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="default"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 glow-neon"
                >
                  <Link to="/booking">Reserve Your Date</Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="border-accent/70 text-accent hover:bg-accent hover:text-accent-foreground font-bold"
                >
                  <Link to="/contact">Talk About Your Event</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
