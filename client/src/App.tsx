import React, { useState, useEffect, lazy, Suspense, useLayoutEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import DebugPage from "@/pages/debug-page";
import { Providers } from "@/components/providers/Providers";
import { GuestRedirect } from "@/components/auth/GuestRedirect";
import { SchedinaSidebar } from "@/components/betting/SchedinaSidebar";
import { ReceiptText, Send } from "lucide-react";
import { WelcomeNotification } from "@/components/notifications/WelcomeNotification";

// Lazy-loaded components
const BuyCreditsPageLazy = lazy(() => import("@/pages/profile/BuyCreditsPage"));

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import RecoverPasswordPage from "@/pages/auth/recover-password";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

// Main app pages
import HomePage from "@/pages/HomePage";
//import TorneiPage from "@/pages/tornei/TorneiPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import GuestProfilePage from "@/pages/profile/GuestProfilePage";
import HistoryPage from "@/pages/profile/HistoryPage";
import BadgesPage from "@/pages/profile/BadgesPage";
import ReferralsPage from "@/pages/profile/ReferralsPage";
import UserLeghePage from "@/pages/profile/UserLeghePage";

// Sports pages
import MatchDetailsPage from "@/pages/sports/MatchDetailsPage";
import AllMatchesPage from "@/pages/sports/AllMatchesPage";
import MatchCalendarPage from "@/pages/sports/MatchCalendarPage";
import LegaDetailsPage from "@/pages/sports/LegaDetailsPage";
import GuestLegaDetailsPage from "@/pages/sports/GuestLegaDetailsPage";
import QuotePage from "@/pages/sports/QuotePage";

// Settings pages
import SettingsPage from "@/pages/settings/SettingsPage";
import ProfileSettingsPage from "@/pages/settings/ProfileSettingsPage";
import NotificationsPage from "@/pages/settings/NotificationsPage";
import DisplayPage from "@/pages/settings/DisplayPage";
import DeleteAccountPage from "@/pages/settings/DeleteAccountPage";
import LogoutPage from "@/pages/settings/LogoutPage";

// Support pages
import AssistenzaPage from "@/pages/support/AssistenzaPage";
import FAQPage from "@/pages/support/FAQPage";
import RegolamentoPage from "@/pages/support/RegolamentoPage";
import ContattiPage from "@/pages/support/ContattiPage";
import TermsPage from "@/pages/support/TermsPage";
import PrivacyPage from "@/pages/support/PrivacyPage";
import GuidePage from "@/pages/support/GuidePage";

// Service Worker Registration
import { useServiceWorker } from "./hooks/useServiceWorker";
import NewLeghePage from "./pages/leghe/newLeghePage";
import CalendarioPartite from "./pages/calendarioPartite";
import PlayerProfile from "./pages/playerProfile";
import PlayerSchedine from "./pages/playerSchedine";
import { useToast } from "./hooks/use-toast";

// Users pages
import SendInviteCode from "./pages/auth/SendInviteCode";

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  const [event, setEvent] = useState<null | Event>(null);
  
  const handleInstallPrompt = (event: Event) => {
    event.preventDefault(); // Prevent the default install prompt
    console.log("Install prompt event received:", event);
    setEvent(event);
  }

  useEffect(() => {
    window.addEventListener("beforeinstallprompt",  handleInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    }
  }, []);


  useEffect(() => {
    if (!event) return;
    toast({
      title: "Installa l' app sul tuo dispositivo!",
      button: {
        label: "Installa",
        onClick: () => {
         event.prompt(); // Show the install prompt
        },
      }
    });
  
  }, [event]);


  // Register Service Worker
  useServiceWorker();

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const closeGuestDialog = () => setShowGuestDialog(false);

  // RegExp per matchare tutte le rotte /sports/tournaments/qualcosa
  const showSchedinaSidebar = /^\/sports\/tournaments\/[^/]+$/.test(location);

  return (
    <TooltipProvider>
      <Toaster />
      <div className="relative flex flex-col w-full min-h-screen bg-neutral-50">
        {/* SchedinaSidebar visibile solo su /sports/tournaments/:id */}
        {showSchedinaSidebar && <SchedinaSidebar />}
        <GuestRedirect isOpen={showGuestDialog} onClose={closeGuestDialog} />

        {/* Notifica di benvenuto al login */}
        {user && <WelcomeNotification />}

        {/* Pulsante globale per aprire la schedina (visibile solo su /sports/tournaments/:id e solo quando l'utente è autenticato) */}
        {user && showSchedinaSidebar && (
          <div className="fixed z-30 bottom-20 right-4">
            <Button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-schedina"))
              }
              className="rounded-full w-14 h-14 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#1C1C1E] shadow-lg"
            >
              <ReceiptText className="w-6 h-6" />
            </Button>
          </div>
        )}
        <Switch>
          {/* Debug pages always accessible */}
          <Route path="/debug" component={DebugPage} />
          <Route path="/debug-auth">{() => <DebugPage />}</Route>
          <Route path="/test" component={PlayerSchedine} />
          {/* Authentication routes (available to guests) */}
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/recover-password" component={RecoverPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />

          {/* Backward compatibility with old routes */}
          <Route path="/auth/login">
            {() => {
              window.location.href = "/login";
              return null;
            }}
          </Route>
          <Route path="/auth/register">
            {() => {
              window.location.href = "/register";
              return null;
            }}
          </Route>

          {/* Public routes (available to both guests and registered users) */}
          <Route path="/">{() => <HomePage />}</Route>

          <Route path="/calendario-partite">{() => <CalendarioPartite />}</Route>

          <Route path="/matches">{() => <AllMatchesPage />}</Route>

          <Route path="/matches/calendar">{() => <MatchCalendarPage />}</Route>

          <Route path="/matches/:id">
            {(params) => <MatchDetailsPage matchId={params.id} />}
          </Route>

          <Route path="/leagues/:name">
            {(params) => <AllMatchesPage league={params.name} />}
          </Route>

          <Route path="/quote">{() => <QuotePage />}</Route>

          <Route path="/player-detailed/:id">{(params) => (<PlayerProfile playerId={params.id} />)}</Route>

          {/* Support routes available to all users */}
          <Route path="/support/assistenza" component={AssistenzaPage} />
          <Route path="/support/contatti" component={ContattiPage} />
          <Route path="/support/faq" component={FAQPage} />
          <Route path="/support/regolamento" component={RegolamentoPage} />
          <Route path="/support/terms" component={TermsPage} />
          <Route path="/support/privacy" component={PrivacyPage} />
          <Route path="/support/guide">
            {() => {
              // Pass props explicitly to ensure type safety
              const props = {
                showHamburgerMenu: !!user,
              };
              return <GuidePage {...props} />;
            }}
          </Route>
          <Route path="/guida-pubblica">
            {() => {
              const props = {
                showHamburgerMenu: false,
                backDestination: "/login",
              };
              return <GuidePage {...props} />;
            }}
          </Route>

          {/* Routes that require login with guest preview */}
          <Route path="/sports/tournaments/:id">
            {(params) =>
              user ? (
                <LegaDetailsPage id={params.id} />
              ) : (
                <GuestLegaDetailsPage id={params.id} />
              )
            }
          </Route>

          {/* Backward compatibility - redirect old route */}
          <Route path="/tournaments/:id">
            {(params) => {
              window.location.href = `/sports/tournaments/${params.id}`;
              return null;
            }}
          </Route>

          <Route path="/profile">
            {() => (user ? <ProfilePage /> : <GuestProfilePage />)}
          </Route>

          <Route path="/sports">
            {() => (
              <NewLeghePage />
            )}
          </Route>

          {/* Protected routes (only authenticated users) */}
          {user && (
            <>
              {/* Profile section */}
              <Route path="/history" component={HistoryPage} />
              <Route path="/badges" component={BadgesPage} />
              <Route path="/referrals" component={ReferralsPage} />
              <Route path="/tournaments" component={UserLeghePage} />
              <Route path="/buy-credits">
                {() => (
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
                      </div>
                    }
                  >
                    <BuyCreditsPageLazy />
                  </Suspense>
                )}
              </Route>
              <Route
                path="/edit-profile"
                component={lazy(async () => ({
                  default: (await import("./pages/profile/EditProfilePage"))
                    .default,
                }))}
              />

              {/* Settings routes */}
              <Route path="/settings" component={SettingsPage} />
              <Route path="/settings/profile" component={ProfileSettingsPage} />
              <Route
                path="/settings/notifications"
                component={NotificationsPage}
              />
              <Route path="/settings/display" component={DisplayPage} />
              <Route
                path="/settings/delete-account"
                component={DeleteAccountPage}
              />
              <Route path="/settings/logout" component={LogoutPage} />
              <Route path="/send-invite-code" component={SendInviteCode} />
                  
              {/* Support routes - additional paths already covered above */}
            </>
          )}

          {/* Fallback to 404 - usa path "/*" per catturare tutte le altre rotte */}
          <Route path="/*" component={NotFound} />
        </Switch>
      </div>
    </TooltipProvider>
  );
}

function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;
