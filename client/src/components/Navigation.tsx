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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Trophy, 
  Globe, 
  Bell, 
  ChevronDown, 
  Menu, 
  User 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NotificationWithDetails } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch all notifications for dropdown
  const { data: allNotifications } = useQuery<NotificationWithDetails[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  const unreadCount = notifications?.length || 0;

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest("PUT", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
                </div>
                {allNotifications && allNotifications.length > 0 ? (
                  allNotifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="p-3 flex flex-col items-start gap-1 cursor-pointer"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="p-3 text-center text-gray-500">
                    No notifications available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
