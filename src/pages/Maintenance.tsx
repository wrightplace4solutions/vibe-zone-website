import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ContactCTA } from "@/components/ContactCTA";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Lightweight landing shown while site is under active development.
// Reuses existing marketing components for consistency.
const Maintenance = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />

      {/* Status / Message */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto relative z-10 max-w-4xl text-center space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            We’re Upgrading Your Experience
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            The full interactive site is being polished behind the scenes. In the meantime you can explore our core services, review package pricing, and reserve your date.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="font-semibold px-8 py-6">
              <Link to="/pricing">View Packages & Pricing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold px-8 py-6">
              <Link to="/booking">Secure Your Date</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Need something custom? Reach out below and we’ll tailor a package for you.
          </p>
        </div>
      </section>

      <Services />
      <LandingPricingPreview />
      <ContactCTA />
    </main>
  );
};

// Simple pricing teaser to encourage click-through
const LandingPricingPreview = () => (
  <section className="px-4 py-24 bg-card/40 backdrop-blur relative">
    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-background" />
    <div className="container mx-auto relative z-10 max-w-5xl text-center space-y-10">
      <h2 className="text-3xl md:text-5xl font-bold">
        Transparent <span className="text-neon-cyan">Pricing</span> & <span className="text-neon-orange">Packages</span>
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        From intimate gatherings to high-energy trail rides — choose the coverage level that fits your vibe. Add-ons available for extended hours, MC services, and enhanced lighting.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { name: "Starter", blurb: "Perfect for small social events (up to 2 hrs)." },
          { name: "Signature", blurb: "Our most booked package – balanced coverage." },
          { name: "Ultimate", blurb: "Full experience + request integration + extended play." },
        ].map((p) => (
          <div key={p.name} className="rounded-xl border border-border bg-background/60 p-6 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{p.blurb}</p>
            <Button asChild size="sm" className="w-full">
              <Link to="/pricing">Details & Rates</Link>
            </Button>
          </div>
        ))}
      </div>
      <div>
        <Button asChild variant="outline" size="lg" className="font-semibold">
          <Link to="/booking">Request A Date</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default Maintenance;
