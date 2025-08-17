import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Menu, 
  Settings, 
  User, 
  LogOut,
  Home,
  Calendar,
  MapPin,
  Users,
  Shield,
  Crown
} from "lucide-react";
import { getLogoSizeConfig } from "@/utils/logoUtils";
import { Link, useLocation } from "wouter";
import type { SystemConfig } from "@shared/schema";

interface MobileHeaderProps {
  isScrolled: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Venues', href: '/venues', icon: MapPin },
  { name: 'Teams', href: '/teams', icon: Users },
];

const adminNavigation = [
  { name: 'SuperAdmin', href: '/superadmin', icon: Crown },
  { name: 'Manager', href: '/manager', icon: Shield },
  { name: 'System Admin', href: '/system-admin', icon: Settings },
];

export default function MobileHeader({ isScrolled }: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch system configuration for logo
  const { data: systemConfig } = useQuery<SystemConfig>({
    queryKey: ["/api/system/config"],
  });

  // Get logo size configuration
  const logoSizeConfig = getLogoSizeConfig(systemConfig?.logoSize || 'medium');

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const isActivePath = (path: string) => {
    if (path === '/' && location === '/') {
      return true;
    }
    if (path !== '/' && location.startsWith(path)) {
      return true;
    }
    return false;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      } lg:hidden`}
      data-testid="mobile-header"
    >
      <div className={`flex items-center justify-between ${logoSizeConfig.headerHeight} px-4`}>
        {/* Left: Navigation Toggle */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              data-testid="mobile-menu-toggle"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-left">Navigation</SheetTitle>
              <SheetDescription className="text-left">
                Access all features and manage your account
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-6">
              {/* Main Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Main
                </h3>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                    >
                      <div
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActivePath(item.href)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        data-testid={`nav-${item.name.toLowerCase()}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Admin Navigation */}
              {user?.role && ['superadmin', 'manager'].includes(user.role) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Administration
                  </h3>
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    
                    // Show different admin options based on role
                    if (item.name === 'SuperAdmin' && user.role !== 'superadmin') {
                      return null;
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSheetOpen(false)}
                      >
                        <div
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActivePath(item.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* User Section */}
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </h3>
                <Link href="/profile" onClick={() => setSheetOpen(false)}>
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
                  data-testid="mobile-logout-button"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2" data-testid="mobile-logo">
            {systemConfig?.logoUrl ? (
              <img
                src={systemConfig.logoUrl}
                alt="Logo"
                className={logoSizeConfig.imageClass}
              />
            ) : (
              <div className={`${logoSizeConfig.containerClass} rounded-lg flex items-center justify-center`}>
                <Crown className={`${logoSizeConfig.iconClass} text-gray-600`} />
              </div>
            )}
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              TMS
            </span>
          </div>
        </Link>

        {/* Right: Profile and Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full"
              data-testid="mobile-profile-menu"
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    {getUserInitials()}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}