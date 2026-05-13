import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { EventEnergySection } from "@/components/EventEnergySection";
import { VibeQueShowcase } from "@/components/VibeQueShowcase";
import { ContactCTA } from "@/components/ContactCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <EventEnergySection />
      <VibeQueShowcase />
      <ContactCTA />
    </div>
  );
};

export default Index;
