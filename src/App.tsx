import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";
import { lazy, Suspense } from "react";

const ComingSoon = lazy(() => import("./pages/ComingSoon"));
// Temporarily disabled while showing coming soon page
// const Index = lazy(() => import("./pages/Index"));
// const Pricing = lazy(() => import("./pages/Pricing"));
// const Booking = lazy(() => import("./pages/Booking"));
// const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
// const VibeQue = lazy(() => import("./pages/VibeQue"));
// const Terms = lazy(() => import("./pages/Terms"));
// const Refunds = lazy(() => import("./pages/Refunds"));
// const Contact = lazy(() => import("./pages/Contact"));
// const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Temporarily showing Coming Soon page for all routes */}
        <Suspense fallback={<div className="p-6 text-foreground">Loading…</div>}>
          <Routes>
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </Suspense>
        {/* Normal routes - uncomment these and remove ComingSoon route above to restore full site */}
        {/* <Navigation />
        <Suspense fallback={<div className="p-6 text-foreground">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/vibeque" element={<VibeQue />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ChatInterface />
        <Footer /> */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
