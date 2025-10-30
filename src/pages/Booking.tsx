import { useState, useRef, useEffect } from "react";
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
import { STRIPE_LINKS, CASHAPP_LINKS, ZELLE_INFO, TZ, PACKAGES, ADD_ONS } from "@/config/booking";
import { Link, useSearchParams } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

type PackageType = "option1" | "option2";

interface FormData {
  date: Date | undefined;
  startTime: string;
  endTime: string;
  venueName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  package: PackageType;
  name: string;
  email: string;
  phone: string;
  notes: string;
  agreedToTerms: boolean;
}

const Booking = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdConfirmed, setHoldConfirmed] = useState(false);
  const [showAddOns, setShowAddOns] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const startTimeRef = useRef<HTMLInputElement>(null);

  // Check for payment status from URL params and verify booking
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');
    
    if (paymentStatus === 'success' && sessionId && bookingId) {
      // Check booking status in database
      const checkBookingStatus = async () => {
        const { data: booking, error } = await supabase
          .from('bookings')
          .select('status')
          .eq('id', bookingId)
          .single();
        
        if (!error && booking?.status === 'confirmed') {
          setBookingConfirmed(true);
          setStep(5); // Show confirmation step
          toast({
            title: "Payment Successful!",
            description: "Your deposit has been received and your booking is confirmed!",
          });
        } else {
          // Status might not be updated yet, show pending message
          toast({
            title: "Payment Processing",
            description: "Your payment is being processed. You'll receive a confirmation email shortly.",
          });
        }
      };
      
      checkBookingStatus();
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again when you're ready.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const [formData, setFormData] = useState<FormData>({
    date: undefined,
    startTime: "",
    endTime: "",
    venueName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    package: "option1",
    name: "",
    email: "",
    phone: "",
    notes: "",
    agreedToTerms: false,
  });

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.venueName || !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please fill out all event details and address fields",
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

  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Save booking to Supabase database
      const { data: booking, error: dbError } = await supabase
        .from("bookings")
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          event_date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
          event_type: "DJ Service", // Default event type
          start_time: formData.startTime,
          end_time: formData.endTime,
          venue_name: formData.venueName,
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          package_type: formData.package,
          service_tier: PACKAGES[formData.package].name,
          total_amount: PACKAGES[formData.package].deposit,
          deposit_amount: PACKAGES[formData.package].deposit,
          notes: formData.notes,
          status: "pending",
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      setHoldConfirmed(true);
      setStep(4);
      toast({
        title: "Hold Requested!",
        description: "Check your email and complete the deposit to confirm.",
      });
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
          <h1 className="text-4xl font-bold mb-2">Thank you for reserving our DJ services.</h1>
          <p className="text-muted-foreground">We are looking forward to helping to make your event unforgettable! #LETSWORK!!</p>
        </div>

        <div className="mb-6 p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            48-Hour Hold Policy
          </h3>
          <p className="text-sm text-muted-foreground">
            Your booking request creates a <strong>48-hour hold</strong> on your selected date. 
            To confirm your booking, please complete the deposit payment within 48 hours. 
            If payment is not received within this timeframe, the hold will be automatically released 
            and you'll receive a notification. Payment made during this session will immediately confirm your booking.
          </p>
        </div>

        <Progress value={progress} className="mb-8" />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Event Details</CardTitle>
              <CardDescription>Tell us about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, date });
                          setIsCalendarOpen(false);
                          // Focus on start time after a short delay to allow popover to close
                          setTimeout(() => {
                            startTimeRef.current?.focus();
                            startTimeRef.current?.showPicker?.();
                          }, 150);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    ref={startTimeRef}
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name *</Label>
                <Input
                  id="venueName"
                  placeholder="e.g., Community Center, Smith Residence"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  placeholder="e.g., 123 Main Street"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  placeholder="ZIP Code"
                  maxLength={5}
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full"
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
                We've placed a temporary 48-HOUR HOLD on your date under "{formData.name} - {formData.date && format(formData.date, "MMM d, yyyy")}". Complete the deposit within 48 hours to confirm your booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">⏰ Important: 48-Hour Hold Policy</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your booking hold expires in 48 hours. If payment is not received by then, the hold will be automatically 
                  released and both you and our team will be notified. Pay now to secure your date immediately!
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">Your Details:</p>
                <p className="text-sm">Client Name: {formData.name}</p>
                <p className="text-sm">Date: {formData.date && format(formData.date, "PPP")}</p>
                <p className="text-sm">Time: {formatTimeTo12Hour(formData.startTime)} - {formatTimeTo12Hour(formData.endTime)}</p>
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
                    Pay Deposit with Stripe - ${PACKAGES[formData.package].deposit}
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

        {step === 5 && bookingConfirmed && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="text-3xl">✓</span> Booking Confirmed!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your payment has been processed and your booking is confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-800 dark:text-green-200">Your Confirmed Event:</p>
                <p className="text-sm"><strong>Date:</strong> {formData.date && format(formData.date, "PPP")}</p>
                <p className="text-sm"><strong>Time:</strong> {formatTimeTo12Hour(formData.startTime)} - {formatTimeTo12Hour(formData.endTime)}</p>
                <p className="text-sm"><strong>Venue:</strong> {formData.venueName}</p>
                <p className="text-sm"><strong>Package:</strong> {PACKAGES[formData.package].name}</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  <strong>Deposit Paid:</strong> ${PACKAGES[formData.package].deposit}
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">What's Next?</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>You'll receive a confirmation email shortly</li>
                  <li>We'll contact you 1-2 weeks before your event to finalize details</li>
                  <li>The remaining balance is due on the day of the event</li>
                </ul>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Questions? Email us at{" "}
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
