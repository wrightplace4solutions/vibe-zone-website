import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, DollarSign, Calendar, FileText, RefreshCw, Mail, Music, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import vibeZoneLogo from "@/assets/vibe-zone-logo.png";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: "/", label: "Home", icon: Home },
    { path: "/pricing", label: "Pricing", icon: DollarSign },
    { path: "/booking", label: "Booking", icon: Calendar },
    { path: "/contact", label: "Contact", icon: Mail },
    { path: "/terms", label: "Terms", icon: FileText },
    { path: "/refunds", label: "Refunds", icon: RefreshCw },
    { path: "/vibeque", label: "VibeQue", icon: Music },
    { path: "/auth", label: "My Bookings", icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button - Left Side */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={vibeZoneLogo} 
              alt="Vibe Zone Entertainment" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Spacer for mobile to keep logo centered */}
          <div className="w-10 md:hidden"></div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
