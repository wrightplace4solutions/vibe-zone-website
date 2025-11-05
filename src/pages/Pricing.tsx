import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Music, Sparkles, Zap, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { PACKAGES, ADD_ONS, IMPORTANT_NOTES } from "@/config/booking";

const Pricing = () => {
  const plugAndPlayPackages = Object.entries(PACKAGES).filter(
    ([_, pkg]) => pkg.category === "Plug-and-Play Options"
  );
  
  const completeSetupPackages = Object.entries(PACKAGES).filter(
    ([_, pkg]) => pkg.category === "Complete Entertainment Setups"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional DJ Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
              Transparent Pricing for Unforgettable Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the perfect package for your event. No hidden fees, just great music and amazing vibes.
            </p>
            
            {/* Disclaimer */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground text-left">
                  <strong className="text-foreground">Note:</strong> Pricing subject to change based on client's individual needs. 
                  <Link to="/contact" className="text-primary hover:underline ml-1">
                    Contact us for customized pricing options.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plug-and-Play Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plug-and-Play Options</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You provide the sound system, we bring the skills and music
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {plugAndPlayPackages.map(([key, pkg]) => (
              <Card key={key} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full"></div>
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.duration}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${pkg.basePrice}</span>
                    <span className="text-muted-foreground ml-2">total</span>
                    <div className="text-sm text-muted-foreground mt-1">
                      Deposit: ${pkg.deposit}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {pkg.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground">Best for:</p>
                    <p className="text-sm mt-1">{pkg.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Entertainment Setups Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Entertainment Setups</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Full professional setup with our sound system and equipment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {completeSetupPackages.map(([key, pkg], idx) => (
              <Card key={key} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all">
                {idx === 0 && (
                  <Badge className="absolute top-4 right-4 z-10">
                    Most Popular
                  </Badge>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full"></div>
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.duration}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${pkg.basePrice}</span>
                    <span className="text-muted-foreground ml-2">total</span>
                    <div className="text-sm text-muted-foreground mt-1">
                      Deposit: ${pkg.deposit}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {pkg.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground">Best for:</p>
                    <p className="text-sm mt-1">{pkg.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enhance Your Experience</h2>
            <p className="text-muted-foreground">
              Add-ons available during checkout with real-time pricing updates
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {ADD_ONS.map((addon, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{addon.name}</CardTitle>
                    <Badge variant="secondary">${addon.price}</Badge>
                  </div>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Important Information</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {IMPORTANT_NOTES.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Book Your Event?</h2>
          <p className="text-xl text-muted-foreground">
            Let's create an unforgettable experience together! #LETSWORK
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link to="/booking">
                Book Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link to="/contact">
                Need Custom Pricing?
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
