import { useState } from "react";
import { Mail, Phone, Instagram, Music2, Facebook, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("inquiries")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          event_date: formData.eventDate || null,
          message: formData.message,
          user_id: session?.user?.id || null,
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        eventDate: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting inquiry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Get In Touch</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Ready to book or have questions? We're here to help! #LETSWORK!!
        </p>

        {/* Contact Form */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Send Us a Message</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Fill out the form below and we'll respond within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="name" className="text-sm">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="eventDate" className="text-sm">Event Date (optional)</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="message" className="text-sm">Message *</Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your event, questions, or special requests..."
                  className="min-h-[100px] sm:min-h-[120px] text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-sm">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Email Us</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Best way to reach us for bookings and inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a href="mailto:booking@vzentertainment.fun">
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">booking@vzentertainment.fun</span>
                </a>
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
                We typically respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Call or Text</CardTitle>
              <CardDescription className="text-xs sm:text-sm">For quick questions or urgent matters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a href="tel:+18049247833">
                  <Phone className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  (804) 924-7833
                </a>
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
                Available Mon-Fri, 8am-10pm EST
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Follow Us</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Check out our latest events and mixes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a
                  href="https://instagram.com/dj.defstef"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  @dj.defstef
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a
                  href="https://facebook.com/djdefstef1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  @djdefstef1
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a
                  href="https://tiktok.com/@djdefstef"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  @djdefstef
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Quick Links</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Everything you need to know</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a href="/booking">
                  Book Your Event
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a href="/terms">
                  View Terms of Service
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                <a href="/refunds">
                  Refund Policy
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 sm:mt-8 border-primary">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="font-medium">Monday - Friday</p>
                <p className="text-muted-foreground">8:00 AM - 10:00 PM EST</p>
              </div>
              <div>
                <p className="font-medium">Saturday - Sunday</p>
                <p className="text-muted-foreground">By Appointment</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
              Events are performed evenings and weekends. Office hours listed above are for inquiries and consultations.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 sm:mt-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Book?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Let's make your event unforgettable!
          </p>
          <Button size="default" asChild className="text-sm">
            <a href="/booking">Start Your Booking</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
