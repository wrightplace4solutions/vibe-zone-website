import { Mail, Phone, Instagram, Facebook, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Thanks for signing up!",
        description: "We'll notify you when we launch.",
      });
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/src/assets/vibe-zone-logo.png" 
            alt="Vibe Zone Entertainment" 
            className="h-32 w-auto"
          />
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            We're cooking up something special for you!
          </p>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            DJ Def Stef and Vibe Zone Entertainment are working on an amazing new experience. Stay tuned!
          </p>
        </div>

        {/* Email Signup */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleEmailSignup} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Notify Me</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-2">
            Get notified when we launch
          </p>
        </div>

        {/* Contact Info */}
        <div className="pt-8 space-y-4">
          <p className="text-sm text-muted-foreground">In the meantime, reach out:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:booking@vzentertainment.fun">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="tel:+18049247833">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </a>
            </Button>
          </div>
        </div>

        {/* Social Links */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">Follow us for updates:</p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://instagram.com/dj.defstef"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://facebook.com/djdefstef1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://tiktok.com/@djdefstef"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <Music2 className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Tagline */}
        <div className="pt-8">
          <p className="text-2xl font-bold text-primary">#LETSWORK</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
