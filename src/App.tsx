import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const App = () => {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

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
        console.error("Error checking maintenance mode:", error);
        // Fallback to false if there's an error
        setMaintenanceMode(false);
        return;
      }

      setMaintenanceMode(data.value === "true");
    } catch (error) {
      console.error("Error checking maintenance mode:", error);
      setMaintenanceMode(false);
    }
  };

  // Show loading while checking maintenance mode
  if (maintenanceMode === null) {
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
