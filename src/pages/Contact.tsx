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
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Get In Touch</h1>
        <p className="text-muted-foreground mb-8">
          Ready to book or have questions? We're here to help! #LETSWORK!!
        </p>

        {/* Contact Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll respond within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date (optional)</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your event, questions, or special requests..."
                  className="min-h-[120px]"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Us</CardTitle>
              <CardDescription>Best way to reach us for bookings and inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="mailto:booking@vzentertainment.fun">
                  <Mail className="mr-2 h-4 w-4" />
                  booking@vzentertainment.fun
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                We typically respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call or Text</CardTitle>
              <CardDescription>For quick questions or urgent matters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="tel:+18049247833">
                  <Phone className="mr-2 h-4 w-4" />
                  (804) 924-7833
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Available Mon-Fri, 8am-10pm EST
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow Us</CardTitle>
              <CardDescription>Check out our latest events and mixes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://instagram.com/dj.defstef"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  @dj.defstef
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://facebook.com/djdefstef1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  @djdefstef1
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://tiktok.com/@djdefstef"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music2 className="mr-2 h-4 w-4" />
                  @djdefstef
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Everything you need to know</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/booking">
                  Book Your Event
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/terms">
                  View Terms of Service
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/refunds">
                  Refund Policy
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-primary">
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Monday - Friday</p>
                <p className="text-muted-foreground">8:00 AM - 10:00 PM EST</p>
              </div>
              <div>
                <p className="font-medium">Saturday - Sunday</p>
                <p className="text-muted-foreground">By Appointment</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Events are performed evenings and weekends. Office hours listed above are for inquiries and consultations.
            </p>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-muted-foreground mb-6">
            Let's make your event unforgettable!
          </p>
          <Button size="lg" asChild>
            <a href="/booking">Start Your Booking</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
