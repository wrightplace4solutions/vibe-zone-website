import { Instagram, Music } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Vibe Zone Entertainment</h3>
            <p className="text-muted-foreground text-sm">
              Professional DJ services for all occasions
            </p>
            <p className="text-primary font-bold mt-4 text-xl">#LETS WORK!!</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/booking" className="text-muted-foreground hover:text-foreground text-sm">
                  Book Now
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-muted-foreground hover:text-foreground text-sm">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/dj.defstef"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://tiktok.com/@djdefstef"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="TikTok"
              >
                <Music className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {currentYear} Vibe Zone Entertainment and Soulware Systems. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
