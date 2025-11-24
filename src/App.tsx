import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase, isSupabaseStub } from "@/integrations/supabase/client";
import { MAINTENANCE_MODE as HARDCODED_MAINTENANCE } from "@/config/maintenance";

const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const VibeQue = lazy(() => import("./pages/VibeQue"));
const Terms = lazy(() => import("./pages/Terms"));
const Refunds = lazy(() => import("./pages/Refunds"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth")); // NEW
const MyBookings = lazy(() => import("./pages/MyBookings")); // NEW
const AdminDashboard = lazy(() => import("./pages/AdminDashboard")); // NEW
const NotFound = lazy(() => import("./pages/NotFound"));
const Maintenance = lazy(() => import("./pages/Maintenance"));

const queryClient = new QueryClient();

const SupabaseEnvBanner = ({ stub }: { stub: boolean }) => {
  if (!stub) return null;
  return (
    <div className="w-full bg-yellow-500 text-black text-xs md:text-sm text-center py-2 z-50">
      Supabase environment variables are missing. Running in limited mode (no data persistence).
    </div>
  );
};

const App = () => {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(HARDCODED_MAINTENANCE);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();

      if (error) {
        // Table doesn't exist yet or other error - use hardcoded value
        console.log("Using hardcoded maintenance mode:", HARDCODED_MAINTENANCE);
        setMaintenanceMode(HARDCODED_MAINTENANCE);
        setIsChecking(false);
        return;
      }

      setMaintenanceMode(data.value === "true");
      setIsChecking(false);
    } catch (error) {
      // Use hardcoded value on error
      console.log("Using hardcoded maintenance mode:", HARDCODED_MAINTENANCE);
      setMaintenanceMode(HARDCODED_MAINTENANCE);
      setIsChecking(false);
    }
  };

  // Show brief loading while checking database
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div>Loading…</div>
      </div>
    );
  }

  if (maintenanceMode) {
    // Show only maintenance landing while flag is enabled.
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SupabaseEnvBanner stub={isSupabaseStub} />
            <Navigation />
            <Suspense fallback={<div className="p-6 text-foreground">Loading…</div>}>
              <Routes>
                <Route path="/" element={<Maintenance />} />
                <Route path="/pricing" element={<Maintenance />} />
                <Route path="/booking" element={<Maintenance />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Maintenance />} />
              </Routes>
            </Suspense>
            <Footer />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SupabaseEnvBanner stub={isSupabaseStub} />
          <Navigation />
          <Suspense fallback={<div className="p-6 text-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking/success" element={<BookingSuccess />} />
              <Route path="/auth" element={<Auth />} /> {/* NEW */}
              <Route path="/my-bookings" element={<MyBookings />} /> {/* NEW */}
              <Route path="/admin" element={<AdminDashboard />} /> {/* NEW */}
              <Route path="/vibeque" element={<VibeQue />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ChatInterface />
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
