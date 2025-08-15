import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, 
  Globe, 
  Bell, 
  ChevronDown, 
  Menu, 
  User 
} from "lucide-react";
import type { NotificationWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const unreadCount = notifications?.length || 0;

  const navLinks = [
    { href: "/", label: "Dashboard", active: location === "/" },
    { href: "/bookings", label: "My Bookings", active: location === "/bookings" },
    { href: "/venues", label: "Venues", active: location === "/venues" },
    { href: "/teams", label: "Teams", active: location === "/teams" },
  ];

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      // Force page reload to clear authentication state
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: still reload the page
      window.location.reload();
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-foreground text-lg" data-testid="logo-icon" />
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-gray-900">Training Management System</h1>
              <p className="text-sm text-gray-500">Bahrain Asian Youth Games 2025</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium border-b-2 transition-colors ${
                  link.active
                    ? "text-primary border-primary"
                    : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  data-testid="language-switcher"
                >
                  <Globe className="h-4 w-4" />
                  <span>EN</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem data-testid="language-en">English</DropdownMenuItem>
                <DropdownMenuItem data-testid="language-ar">العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              data-testid="notifications-button"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="notification-count"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3"
                  data-testid="user-menu-trigger"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900" data-testid="user-name">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </p>
                    <p className="text-xs text-gray-500 capitalize" data-testid="user-role">
                      {user.role} {user.countryCode && `- ${user.countryCode}`}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    {user.profileImageUrl ? (
                      <img 
                        src={`${user.profileImageUrl}?v=${user.updatedAt || new Date().getTime()}`} 
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
                  <ChevronDown className="h-3 w-3 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem data-testid="profile-menu-item">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  </div>
                  <nav className="space-y-2">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href}
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          link.active
                            ? "text-primary bg-primary/10"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
