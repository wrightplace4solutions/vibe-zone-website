import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ZAP_CATCH_HOOK, STRIPE_LINKS, CASHAPP_LINKS, ZELLE_INFO, TZ, PACKAGES, ADD_ONS } from "@/config/booking";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type PackageType = "option1" | "option2";

interface FormData {
  date: Date | undefined;
  startTime: string;
  endTime: string;
  venue: string;
  package: PackageType;
  name: string;
  email: string;
  phone: string;
  notes: string;
  agreedToTerms: boolean;
}

const Booking = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdConfirmed, setHoldConfirmed] = useState(false);
  const [showAddOns, setShowAddOns] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    date: undefined,
    startTime: "",
    endTime: "",
    venue: "",
    package: "option1",
    name: "",
    email: "",
    phone: "",
    notes: "",
    agreedToTerms: false,
  });

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.venue) {
        toast({
          title: "Missing Information",
          description: "Please fill out all event details",
          variant: "destructive",
        });
        return false;
      }
    }
    if (stepNum === 3) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill out all contact fields",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.agreedToTerms) {
        toast({
          title: "Terms Required",
          description: "Please agree to the Terms and Refund Policy",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
      start: formData.startTime,
      end: formData.endTime,
      venue: formData.venue,
      package: PACKAGES[formData.package].name,
      deposit: PACKAGES[formData.package].deposit,
      notes: formData.notes,
      timezone: TZ,
      source: "vzentertainment.fun",
    };

    try {
      const response = await fetch(ZAP_CATCH_HOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.type === "opaque") {
        setHoldConfirmed(true);
        setStep(4);
        toast({
          title: "Hold Requested!",
          description: "Check your email and complete the deposit to confirm.",
        });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Unable to submit request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Book Your Event</h1>
          <p className="text-muted-foreground">Let's make your event unforgettable! #LETS WORK!!</p>
        </div>

        <Progress value={progress} className="mb-8" />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Event Details</CardTitle>
              <CardDescription>Tell us about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Venue / Address *</Label>
                <Input
                  id="venue"
                  placeholder="Where's the party at?"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Choose Your Package</CardTitle>
              <CardDescription>Select the option that fits your vibe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.package}
                onValueChange={(value) => setFormData({ ...formData, package: value as PackageType })}
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="option1" id="option1" />
                  <div className="flex-1">
                    <Label htmlFor="option1" className="text-base font-semibold cursor-pointer">
                      {PACKAGES.option1.name} — ${PACKAGES.option1.basePrice}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {PACKAGES.option1.description}
                    </p>
                    <p className="text-sm font-medium text-primary mt-2">
                      Deposit due now: ${PACKAGES.option1.deposit}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="option2" id="option2" />
                  <div className="flex-1">
                    <Label htmlFor="option2" className="text-base font-semibold cursor-pointer">
                      {PACKAGES.option2.name} — ${PACKAGES.option2.basePrice}+
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {PACKAGES.option2.description}
                    </p>
                    <p className="text-sm font-medium text-primary mt-2">
                      Deposit due now: ${PACKAGES.option2.deposit}
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <Collapsible open={showAddOns} onOpenChange={setShowAddOns}>
                <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <ChevronRight className={cn("h-4 w-4 mr-1 transition-transform", showAddOns && "rotate-90")} />
                  View available add-ons (for reference)
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="space-y-2 pl-5">
                    {ADD_ONS.map((addon) => (
                      <div key={addon.name} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{addon.name}</span>
                        <span className="font-medium">${addon.price}</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-3">
                      Specify any add-ons you're interested in the notes section on the next step
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Contact & Agreement</CardTitle>
              <CardDescription>How can we reach you?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Tell us about your event, music preferences, add-ons you're interested in, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex items-start space-x-2 p-4 border rounded-lg bg-muted/50">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreedToTerms: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" target="_blank" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/refunds" target="_blank" className="text-primary hover:underline">
                      Refund/Deposit Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Request Hold"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && holdConfirmed && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Hold Requested Successfully!</CardTitle>
              <CardDescription>
                We've placed a temporary HOLD on your date. Complete the deposit within 24 hours to confirm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">Your Details:</p>
                <p className="text-sm">Date: {formData.date && format(formData.date, "PPP")}</p>
                <p className="text-sm">Time: {formData.startTime} - {formData.endTime}</p>
                <p className="text-sm">Package: {PACKAGES[formData.package].name}</p>
                <p className="text-sm text-primary font-semibold">
                  Deposit Required: ${PACKAGES[formData.package].deposit}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred payment method to complete your ${PACKAGES[formData.package].deposit} deposit:
              </p>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a
                    href={STRIPE_LINKS[formData.package]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pay with Stripe (Card) - ${PACKAGES[formData.package].deposit}
                  </a>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={CASHAPP_LINKS[formData.package]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pay with Cash App - ${PACKAGES[formData.package].deposit}
                  </a>
                </Button>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="font-medium mb-2">Pay with Zelle:</p>
                  <div className="text-sm space-y-1">
                    <p>Email: <span className="font-mono text-primary">{ZELLE_INFO.email}</span></p>
                    <p>Phone: <span className="font-mono text-primary">{ZELLE_INFO.phone}</span></p>
                    <p className="text-muted-foreground mt-2">Amount: ${PACKAGES[formData.package].deposit}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      After sending, reply to your confirmation email with the transaction ID
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Need help? Email us at{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline">
                  bookings@vzentertainment.fun
                </a>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Booking;
