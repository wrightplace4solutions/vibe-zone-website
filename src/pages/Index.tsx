import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { VibeQueShowcase } from "@/components/VibeQueShowcase";
import { ContactCTA } from "@/components/ContactCTA";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <VibeQueShowcase />
      <ContactCTA />
      <ChatInterface />
    </div>
  );
};

export default Index;
