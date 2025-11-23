import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ContactCTA } from "@/components/ContactCTA";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Lightweight landing shown while site is under active development.
// Reuses existing marketing components for consistency.
const Maintenance = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("leads")
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message || null,
          source: "maintenance_page",
        }]);

      if (error) throw error;

      toast({
        title: "Thanks for reaching out!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Submission failed",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Lead Capture Form */}
      <section className="px-4 py-24 bg-background">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Get In Touch</CardTitle>
              <CardDescription>
                Have questions or ready to book? Drop us a message and we'll respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your event or ask a question..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

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
