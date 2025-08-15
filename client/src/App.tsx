import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import SecureLogin from "@/pages/SecureLogin";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import UserDashboard from "@/pages/UserDashboard";
import Bookings from "@/pages/Bookings";
import Venues from "@/pages/Venues";
import Teams from "@/pages/Teams";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    if (!user) return SecureLogin;
    
    switch (user.role) {
      case 'superadmin':
        return SuperAdminDashboard;
      case 'manager':
        return ManagerDashboard;
      case 'user':
      case 'customer':
        return UserDashboard;
      default:
        return UserDashboard;
    }
  };

  return (
    <>
      {isAuthenticated && <Navigation />}
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={SecureLogin} />
        ) : (
          <>
            <Route path="/dashboard" component={getDashboardComponent()} />
            <Route path="/" component={getDashboardComponent()} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/venues" component={Venues} />
            <Route path="/teams" component={Teams} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
