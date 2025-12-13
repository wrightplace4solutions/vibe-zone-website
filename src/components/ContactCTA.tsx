import { Button } from "@/components/ui/button";
import { Mail, Phone, Instagram } from "lucide-react";

export const ContactCTA = () => {
  return (
    <section className="py-10 md:py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-background to-background"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl animate-glow-pulse"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            <span className="text-neon-orange">#LETSWORK</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Ready to bring the ultimate line dance and trail ride experience to your next event?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 py-4 glow-neon transition-all hover:scale-105 gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
            <Button 
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm px-6 py-4 transition-all hover:scale-105 gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </Button>
          </div>
          
          <div className="flex justify-center gap-6">
            <a 
              href="https://instagram.com/dj.defstef" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
