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
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { STRIPE_LINKS, CASHAPP_LINKS, ZELLE_INFO, TZ, PACKAGES, ADD_ONS } from "@/config/booking";
import { Link, useSearchParams } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { z } from 'zod';

// Comprehensive validation schema
const bookingSchema = z.object({
  // Event Details
  date: z.date({
    required_error: "Event date is required",
    invalid_type_error: "Please select a valid date",
  }),
  startTime: z.string()
    .min(1, "Start time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string()
    .min(1, "End time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  
  // Venue Details
  venueName: z.string()
    .trim()
    .min(1, "Venue name is required")
    .max(200, "Venue name must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s\-.,&'()]+$/, "Venue name contains invalid characters"),
  streetAddress: z.string()
    .trim()
    .min(1, "Street address is required")
    .max(200, "Street address must be less than 200 characters"),
  city: z.string()
    .trim()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-.']+$/, "City contains invalid characters"),
  state: z.string()
    .trim()
    .length(2, "State must be 2 characters")
    .regex(/^[A-Z]{2}$/, "State must be 2 uppercase letters (e.g., TX, CA)")
    .refine((val) => {
      // Validate against actual US state codes
      const validStates = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
      return validStates.includes(val);
    }, "Invalid US state code"),
  zipCode: z.string()
    .trim()
    .regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  
  // Package & Add-ons
  package: z.enum(["essentialVibe", "premiumExperience", "vzPartyStarter", "ultimateExperience"], {
    errorMap: () => ({ message: "Please select a valid package" }),
  }),
  selectedAddOns: z.array(z.string()).default([]),
  
  // Contact Details
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-.']+$/, "Name can only contain letters, spaces, hyphens, apostrophes, and periods"),
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  phone: z.string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-()]+$/, "Phone number contains invalid characters")
    .transform((val) => val.replace(/\D/g, '')) // Remove non-digits
    .refine((val) => val.length >= 10, "Phone number must be at least 10 digits")
    .refine((val) => val.length <= 15, "Phone number must be less than 15 digits"),
  
  // Notes & Terms
  notes: z.string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .default(""),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Refund Policy",
  }),
  honeypot: z.string().max(0, "Suspicious submission").default(""),
});

// Type inference from schema
type BookingFormData = z.infer<typeof bookingSchema>;

type PackageType = "essentialVibe" | "premiumExperience" | "vzPartyStarter" | "ultimateExperience";

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
  selectedAddOns: string[];
  name: string;
  email: string;
  phone: string;
  notes: string;
  agreedToTerms: boolean;
  honeypot: string;
}

const MIN_FORM_COMPLETION_MS = 5000;

const Booking = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdConfirmed, setHoldConfirmed] = useState(false);
  const [showAddOns, setShowAddOns] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const formStartRef = useRef<number>(Date.now());

  // Fetch unavailable dates on component mount
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("bookings")
        .select("event_date")
        .in("status", ["pending", "confirmed"]);
      
      if (data) {
        setUnavailableDates(data.map(b => new Date(b.event_date)));
      }
    };
    fetchUnavailableDates();
  }, []);

  // Check for payment status from URL params and verify booking
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');
    
    if (bookingId) {
      setActiveBookingId(bookingId);
    }

    if (paymentStatus === 'success' && sessionId && bookingId) {
      const checkBookingStatus = async () => {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data, error } = await supabase.functions.invoke('get-booking-status', {
            body: { bookingId, sessionId },
          });

          if (!error && data?.booking?.status === 'confirmed') {
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
        } catch (e) {
          console.error('Booking status check failed', e);
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
    package: "essentialVibe",
    selectedAddOns: [],
    name: "",
    email: "",
    phone: "",
    notes: "",
    agreedToTerms: false,
    honeypot: "",
  });

  const validateStep = (stepNum: number): boolean => {
    try {
      if (stepNum === 1) {
        // Validate Step 1 fields
        const step1Schema = bookingSchema.pick({
          date: true,
          startTime: true,
          endTime: true,
          venueName: true,
          streetAddress: true,
          city: true,
          state: true,
          zipCode: true,
        });
        
        step1Schema.parse(formData);
        
        // Note: Events can span midnight (e.g., 10:00 PM to 1:00 AM next day)
        // No additional time validation needed - both times are validated by schema
      }
      
      if (stepNum === 3) {
        // Validate Step 3 fields
        const step3Schema = bookingSchema.pick({
          name: true,
          email: true,
          phone: true,
          agreedToTerms: true,
        });
        
        step3Schema.parse(formData);
      }
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Show the first validation error to the user
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      }
      return false;
    }
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

  const calculateTotals = () => {
    const basePrice = PACKAGES[formData.package].basePrice;
    const addOnsTotal = formData.selectedAddOns.reduce((sum, addonName) => {
      const addon = ADD_ONS.find(a => a.name === addonName);
      return sum + (addon?.price || 0);
    }, 0);
    const totalAmount = basePrice + addOnsTotal;
    const depositAmount = Math.round(totalAmount * 0.5); // 50% deposit
    return { basePrice, addOnsTotal, totalAmount, depositAmount };
  };

  const handleSubmit = async () => {
    // Validate all fields before submission
    try {
      bookingSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      }
      return;
    }

    // Honeypot check (already validated by schema)
    if (formData.honeypot.trim().length > 0) {
      toast({
        title: "Submission blocked",
        description: "We could not verify your request. Please contact us directly.",
        variant: "destructive",
      });
      return;
    }

    // Time-on-form check
    const timeOnForm = Date.now() - formStartRef.current;
    if (timeOnForm < MIN_FORM_COMPLETION_MS) {
      toast({
        title: "Almost there",
        description: "Take a moment to review your details before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Non-blocking: log booking attempt for rate limiting
      try {
        const emailForRateLimit = formData.email || "";
        const encoder = new TextEncoder();
        const fingerprintSource = `${navigator.userAgent}`;
        const digest = await crypto.subtle.digest(
          "SHA-256",
          encoder.encode(fingerprintSource)
        );
        const hashArray = Array.from(new Uint8Array(digest));
        const ipHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (emailForRateLimit) {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase
            .from("booking_rate_limits")
            .insert({ email: emailForRateLimit, ip_hash: ipHash });
        }
      } catch (e) {
        console.warn("Rate limit logging failed (non-blocking):", e);
      }
      const eventDate = formData.date ? format(formData.date, "yyyy-MM-dd") : "";
      const payload = {
        packageType: formData.package,
        selectedAddOns: formData.selectedAddOns,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        event: {
          date: eventDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          venueName: formData.venueName,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        notes: formData.notes,
        honeypot: formData.honeypot,
      };

      const { supabase } = await import("@/integrations/supabase/client");
      
        // Debug: Check if environment variables are loaded
        console.log('Environment check:', {
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        });
      
      console.log('Submitting booking request with payload:', payload);
      
      const { data, error } = await supabase.functions.invoke("create-booking-hold", {
        body: payload,
      });

      console.log('Booking response:', { data, error });

      if (error) {
        console.error('Booking submission error:', error);
        const status = (error as { status?: number })?.status;
        const errorMessage = error.message ?? "Unable to submit request. Please try again or contact us directly.";
        
        toast({
          title: status === 429 ? "Too many requests" : "Booking Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (!data?.booking?.id) {
        console.error('Invalid booking response - missing booking ID:', data);
        throw new Error("Missing booking response");
      }

      setActiveBookingId(data.booking.id);
      setHoldConfirmed(true);
      setStep(4);
      toast({
        title: "Hold Requested!",
        description: "Check your email and complete the deposit to confirm.",
      });
    } catch (error) {
      console.error("Booking submission error:", error);
      
      let errorMessage = "Unable to submit request. Please try again or contact us directly.";
      let errorTitle = "Booking Error";
      
      // Check for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
        errorTitle = "Connection Error";
      }
      // Check for other common errors
      else if (error instanceof Error) {
        if (error.message.includes("Missing booking response")) {
          errorMessage = "Booking was created but we couldn't confirm it. Please contact support.";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
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

        <Progress value={progress} className="mb-8" />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Event Details</CardTitle>
              <CardDescription>Tell us about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
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
                      disabled={(date) => 
                        date < new Date() || // Past dates
                        unavailableDates.some(d => isSameDay(d, date)) // Booked dates
                      }
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
                {Object.entries(PACKAGES).map(([key, pkg]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary/50 transition-all">
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <Label htmlFor={key} className="text-base font-semibold cursor-pointer">
                        {pkg.name} — ${pkg.basePrice}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pkg.duration} • {pkg.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {pkg.bestFor}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Add-Ons (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select any add-ons to see real-time pricing updates
                </p>
                <div className="space-y-3">
                  {ADD_ONS.map((addon) => (
                    <div key={addon.name} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={addon.name}
                        checked={formData.selectedAddOns.includes(addon.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedAddOns: [...formData.selectedAddOns, addon.name],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedAddOns: formData.selectedAddOns.filter(a => a !== addon.name),
                            });
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={addon.name} className="cursor-pointer font-medium">
                          {addon.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                      <span className="font-semibold text-primary">${addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(() => {
                const { basePrice, addOnsTotal, totalAmount, depositAmount } = calculateTotals();
                return (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Package: {PACKAGES[formData.package].name}</span>
                      <span>${basePrice}</span>
                    </div>
                    {formData.selectedAddOns.length > 0 && (
                      <>
                        <div className="text-sm font-medium">Selected Add-ons:</div>
                        {formData.selectedAddOns.map(addonName => {
                          const addon = ADD_ONS.find(a => a.name === addonName);
                          return (
                            <div key={addonName} className="flex justify-between text-sm pl-4">
                              <span className="text-muted-foreground">{addonName}</span>
                              <span>${addon?.price}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${basePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Add-ons Total:</span>
                        <span>${addOnsTotal}</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-primary">${totalAmount}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base mt-1">
                        <span>Deposit Due Now (50%):</span>
                        <span className="text-accent">${depositAmount}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

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

              {(() => {
                const { basePrice, addOnsTotal, totalAmount, depositAmount } = calculateTotals();
                return (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="font-medium">Your Details:</p>
                    <p className="text-sm">Client Name: {formData.name}</p>
                    <p className="text-sm">Date: {formData.date && format(formData.date, "PPP")}</p>
                    <p className="text-sm">Time: {formatTimeTo12Hour(formData.startTime)} - {formatTimeTo12Hour(formData.endTime)}</p>
                    <p className="text-sm">Package: {PACKAGES[formData.package].name}</p>
                    {formData.selectedAddOns.length > 0 && (
                      <p className="text-sm">Add-ons: {formData.selectedAddOns.join(", ")}</p>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <p className="text-sm">Total: ${totalAmount}</p>
                      <p className="text-sm text-primary font-semibold">
                        Deposit Required (50%): ${depositAmount}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred payment method to complete your ${calculateTotals().depositAmount} deposit:
              </p>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={async () => {
                    try {
                      if (!activeBookingId) {
                        toast({
                          title: "Booking required",
                          description: "Create your hold before starting payment.",
                          variant: "destructive",
                        });
                        return;
                      }
                      const { supabase } = await import("@/integrations/supabase/client");
                      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                        body: {
                          bookingId: activeBookingId,
                          packageType: formData.package,
                          customerEmail: formData.email,
                          customerName: formData.name,
                          customerPhone: formData.phone,
                          eventDate: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
                          eventDetails: {
                            venueName: formData.venueName,
                            streetAddress: formData.streetAddress,
                            city: formData.city,
                            state: formData.state,
                            zipCode: formData.zipCode,
                            startTime: formData.startTime,
                            endTime: formData.endTime,
                          },
                          notes: formData.notes,
                        },
                      });

                      if (error) throw error;
                      if (data?.url) {
                        window.location.href = data.url;
                      }
                    } catch (error) {
                      console.error('Stripe checkout error:', error);
                      toast({
                        title: "Error",
                        description: "Unable to start payment. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Pay Deposit with Stripe - ${calculateTotals().depositAmount}
                </Button>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="font-medium mb-2">Pay with Zelle:</p>
                  <div className="text-sm space-y-1">
                    <p>Email: <span className="font-mono text-primary">{ZELLE_INFO.email}</span></p>
                    <p>Phone: <span className="font-mono text-primary">{ZELLE_INFO.phone}</span></p>
                    <p className="text-muted-foreground mt-2">Amount: ${calculateTotals().depositAmount}</p>
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
              {(() => {
                const { totalAmount, depositAmount } = calculateTotals();
                return (
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
                    <p className="font-medium text-green-800 dark:text-green-200">Your Confirmed Event:</p>
                    <p className="text-sm"><strong>Date:</strong> {formData.date && format(formData.date, "PPP")}</p>
                    <p className="text-sm"><strong>Time:</strong> {formatTimeTo12Hour(formData.startTime)} - {formatTimeTo12Hour(formData.endTime)}</p>
                    <p className="text-sm"><strong>Venue:</strong> {formData.venueName}</p>
                    <p className="text-sm"><strong>Package:</strong> {PACKAGES[formData.package].name}</p>
                    {formData.selectedAddOns.length > 0 && (
                      <p className="text-sm"><strong>Add-ons:</strong> {formData.selectedAddOns.join(", ")}</p>
                    )}
                    <p className="text-sm"><strong>Total Amount:</strong> ${totalAmount}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      <strong>Deposit Paid:</strong> ${depositAmount}
                    </p>
                  </div>
                );
              })()}

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
