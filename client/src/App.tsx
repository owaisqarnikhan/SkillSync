import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import NotFound from "@/pages/not-found";
import SecureLogin from "@/pages/SecureLogin";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import UserDashboard from "@/pages/UserDashboard";
import Bookings from "@/pages/Bookings";
import Venues from "@/pages/Venues";
import Teams from "@/pages/Teams";
import Profile from "@/pages/Profile";
import SystemAdmin from "@/pages/SystemAdmin";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isScrolled } = useScrollPosition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };
    
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);

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

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={SecureLogin} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - shown only on mobile screens */}
      <MobileHeader isScrolled={isScrolled} />
      
      {/* Desktop Sidebar - hidden on mobile */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 pt-16 lg:pt-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <main className="min-h-screen">
          <Switch>
            {/* Main Dashboard - shows role-based dashboard */}
            <Route path="/" component={getDashboardComponent()} />
            
            {/* Specific Role Dashboards accessed via profile menu */}
            <Route path="/dashboard/superadmin" component={SuperAdminDashboard} />
            <Route path="/dashboard/manager" component={ManagerDashboard} />
            <Route path="/dashboard/user" component={UserDashboard} />
            
            {/* Application Pages */}
            <Route path="/bookings" component={Bookings} />
            <Route path="/venues" component={Venues} />
            <Route path="/teams" component={Teams} />
            <Route path="/profile" component={Profile} />
            <Route path="/system-admin" component={SystemAdmin} />
            <Route path="/superadmin" component={SuperAdminDashboard} />
            <Route path="/manager" component={ManagerDashboard} />
            
            {/* Catch-all */}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
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
