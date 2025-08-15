import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { SystemConfig } from "@shared/schema";
import { 
  Trophy, 
  Globe, 
  Bell, 
  ChevronDown, 
  Menu, 
  User,
  Calendar,
  MapPin,
  Users,
  Settings,
  BarChart3,
  Monitor,
  LogOut,
  Home,
  X
} from "lucide-react";
import type { NotificationWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch unread notifications count
  const { data: notifications } = useQuery<NotificationWithDetails[]>({
    queryKey: ["/api/notifications", "unreadOnly=true"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/notifications?unreadOnly=true", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  // Fetch system configuration for logo
  const { data: systemConfig } = useQuery<SystemConfig>({
    queryKey: ["/api/system/config"],
    enabled: isAuthenticated,
  });

  const unreadCount = notifications?.length || 0;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      // Redirect to login page instead of reloading
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: still redirect to login
      window.location.href = "/";
    }
  };

  const navigateToMainDashboard = () => {
    setLocation("/");
    setIsMobileOpen(false);
  };

  const navigateToRoleDashboard = (dashboardType: string) => {
    setLocation(`/dashboard/${dashboardType}`);
    setIsMobileOpen(false);
  };

  const navItems = [
    { 
      href: "/bookings", 
      label: "My Bookings", 
      icon: Calendar,
      active: location === "/bookings" 
    },
    { 
      href: "/venues", 
      label: "Venues", 
      icon: MapPin,
      active: location === "/venues" 
    },
    { 
      href: "/teams", 
      label: "Teams", 
      icon: Users,
      active: location === "/teams" 
    },
  ];

  if (!isAuthenticated || !user) {
    return null;
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              {systemConfig?.logoUrl ? (
                <img 
                  src={systemConfig.logoUrl}
                  alt="Dashboard Logo"
                  className="w-full h-full object-contain"
                  data-testid="sidebar-logo-image"
                />
              ) : (
                <Trophy className="text-white text-lg" data-testid="sidebar-logo" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm text-gray-900 truncate">Training System</h1>
              <p className="text-xs text-gray-500 truncate">Bahrain Asian Youth Games 2025</p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
              data-testid="close-mobile-sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {/* Main Dashboard */}
          <Button
            variant={location === "/" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={navigateToMainDashboard}
            data-testid="nav-dashboard"
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsMobileOpen(false)}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}

          {/* Admin/Manager Only */}
          {(user.role === 'superadmin' || user.role === 'manager') && (
            <div className="pt-4 border-t">
              <p className="px-2 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Administration
              </p>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setLocation("/admin/system");
                  isMobile && setIsMobileOpen(false);
                }}
                data-testid="nav-system-config"
              >
                <Settings className="mr-2 h-4 w-4" />
                System Admin
              </Button>
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-4 border-t">
        <div className="space-y-3">
          {/* Language & Notifications */}
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  data-testid="language-switcher"
                >
                  <Globe className="h-3 w-3" />
                  <span className="text-xs">EN</span>
                  <ChevronDown className="h-2 w-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem data-testid="language-en">English</DropdownMenuItem>
                <DropdownMenuItem data-testid="language-ar">العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              data-testid="notifications-button"
            >
              <Bell className="h-3 w-3" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  data-testid="notification-count"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full flex items-center space-x-3 px-3 py-2 h-auto"
                data-testid="profile-menu-trigger"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                      data-testid="user-avatar-image"
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary-foreground" data-testid="user-avatar-initials">
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" data-testid="user-name">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate" data-testid="user-role">
                    {user.role} {user.countryCode && `- ${user.countryCode}`}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-500 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => {
                setLocation("/profile");
                isMobile && setIsMobileOpen(false);
              }} data-testid="profile-menu-item">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
              
              {/* Main Dashboard */}
              <DropdownMenuItem onClick={navigateToMainDashboard} data-testid="dashboard-main">
                <Home className="h-4 w-4 mr-2" />
                Main Dashboard
              </DropdownMenuItem>
              
              {/* Role-based Dashboards */}
              {user.role === 'superadmin' && (
                <>
                  <DropdownMenuItem onClick={() => navigateToRoleDashboard('superadmin')} data-testid="dashboard-superadmin">
                    <Monitor className="h-4 w-4 mr-2" />
                    SuperAdmin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateToRoleDashboard('manager')} data-testid="dashboard-manager">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Manager Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateToRoleDashboard('user')} data-testid="dashboard-user">
                    <User className="h-4 w-4 mr-2" />
                    User Dashboard
                  </DropdownMenuItem>
                </>
              )}
              
              {user.role === 'manager' && (
                <DropdownMenuItem onClick={() => navigateToRoleDashboard('manager')} data-testid="dashboard-manager">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Manager Dashboard
                </DropdownMenuItem>
              )}
              
              {(user.role === 'user' || user.role === 'customer') && (
                <DropdownMenuItem onClick={() => navigateToRoleDashboard('user')} data-testid="dashboard-user">
                  <User className="h-4 w-4 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-40 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-gray-50"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}