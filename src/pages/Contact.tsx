import { Mail, Phone, Instagram, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Get In Touch</h1>
        <p className="text-muted-foreground mb-8">
          Ready to book or have questions? We're here to help! #LETS WORK!!
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Us</CardTitle>
              <CardDescription>Best way to reach us for bookings and inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="mailto:bookings@vzentertainment.fun">
                  <Mail className="mr-2 h-4 w-4" />
                  bookings@vzentertainment.fun
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
                <a href="tel:+15551234567">
                  <Phone className="mr-2 h-4 w-4" />
                  (555) 123-4567
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Available Mon-Fri, 10am-6pm EST
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
                  href="https://instagram.com/vzentertainment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  @vzentertainment
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://tiktok.com/@vzentertainment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music className="mr-2 h-4 w-4" />
                  @vzentertainment
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
                <p className="text-muted-foreground">10:00 AM - 6:00 PM EST</p>
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
