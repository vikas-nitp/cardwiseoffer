import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeatureFlagProvider, useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { MetaProvider } from "@/contexts/MetaContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SignInModal from "@/components/SignInModal";
import CookieConsent from "@/components/CookieConsent";

const ConditionalCookieConsent = () => {
  const { flags } = useFeatureFlags();
  return flags.cookieConsentEnabled ? <CookieConsent /> : null;
};
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProfilePage from "./pages/ProfilePage";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <FeatureFlagProvider>
      <MetaProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SignInModal />
            <ConditionalCookieConsent />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </MetaProvider>
    </FeatureFlagProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
