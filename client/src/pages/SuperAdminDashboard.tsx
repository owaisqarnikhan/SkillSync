import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings,
  Users,
  Shield,
  BarChart3,
  FileText,
  Crown,
  Database,
  Mail,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Flag,
  Trophy,
  Building,
  Check,
  X
} from "lucide-react";
import type { SystemConfig, DashboardPermission, User, TeamWithDetails, VenueWithDetails, BookingWithDetails, Country, Sport, VenueType, InsertTeam, InsertVenue, InsertSport, InsertCountry, InsertVenueType } from "@shared/schema";

interface UserFormData {
  username?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'superadmin' | 'manager' | 'user' | 'customer';
  countryCode?: string;
  isActive?: boolean;
}

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [systemConfig, setSystemConfig] = useState<Partial<SystemConfig>>({});
  
  // Team management state
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null);
  const [teamFormData, setTeamFormData] = useState<Partial<InsertTeam>>({});
  
  // Venue management state
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueWithDetails | null>(null);
  const [venueFormData, setVenueFormData] = useState<Partial<InsertVenue>>({});
  
  // User management state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({});
  
  // Sports management state
  const [sportsModalOpen, setSportsModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [sportsFormData, setSportsFormData] = useState<Partial<InsertSport>>({});
  
  // Countries management state
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryFormData, setCountryFormData] = useState<Partial<InsertCountry>>({});

  // Venue Types management state
  const [venueTypeModalOpen, setVenueTypeModalOpen] = useState(false);
  const [selectedVenueType, setSelectedVenueType] = useState<VenueType | null>(null);
  const [venueTypeFormData, setVenueTypeFormData] = useState<Partial<InsertVenueType>>({});

  // Redirect if not SuperAdmin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'superadmin')) {
      toast({
        title: "Access Denied",
        description: "SuperAdmin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch system configuration
  const { data: config, isLoading: configLoading } = useQuery<SystemConfig>({
    queryKey: ["/api/system/config/admin"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });

  // Fetch dashboard permissions
  const { data: permissions = [] } = useQuery<DashboardPermission[]>({
    queryKey: ["/api/dashboard/permissions"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });
  
  // Fetch teams, venues, bookings data
  const { data: teams = [] } = useQuery<TeamWithDetails[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });
  
  const { data: venues = [] } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });
  
  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });
  
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });
  
  const { data: sports = [] } = useQuery<Sport[]>({
    queryKey: ["/api/sports"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });
  
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });
  
  const { data: venueTypes = [] } = useQuery<VenueType[]>({
    queryKey: ["/api/venue-types"],
    enabled: isAuthenticated && user?.role === 'superadmin',
  });

  // Update system configuration
  const updateConfigMutation = useMutation({
    mutationFn: (updates: Partial<SystemConfig>) => 
      apiRequest("PUT", "/api/system/config", updates),
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "System configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system/config"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Team CRUD mutations
  const createTeamMutation = useMutation({
    mutationFn: (data: InsertTeam) => apiRequest("POST", "/api/teams", data),
    onSuccess: () => {
      toast({ title: "Team Created", description: "Team has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setTeamModalOpen(false);
      setTeamFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTeam> }) => 
      apiRequest("PUT", `/api/teams/${id}`, data),
    onSuccess: () => {
      toast({ title: "Team Updated", description: "Team has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setTeamModalOpen(false);
      setSelectedTeam(null);
      setTeamFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/teams/${id}`),
    onSuccess: () => {
      toast({ title: "Team Deleted", description: "Team has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Venue CRUD mutations
  const createVenueMutation = useMutation({
    mutationFn: (data: InsertVenue) => apiRequest("POST", "/api/venues", data),
    onSuccess: () => {
      toast({ title: "Venue Created", description: "Venue has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setVenueModalOpen(false);
      setVenueFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateVenueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertVenue> }) => 
      apiRequest("PUT", `/api/venues/${id}`, data),
    onSuccess: () => {
      toast({ title: "Venue Updated", description: "Venue has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setVenueModalOpen(false);
      setSelectedVenue(null);
      setVenueFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteVenueMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/venues/${id}`),
    onSuccess: () => {
      toast({ title: "Venue Deleted", description: "Venue has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Booking CRUD mutations
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/bookings/${id}`, data),
    onSuccess: () => {
      toast({ title: "Booking Updated", description: "Booking has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteBookingMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/bookings/${id}`),
    onSuccess: () => {
      toast({ title: "Booking Deleted", description: "Booking has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (config) {
      setSystemConfig(config);
    }
  }, [config]);

  const handleConfigUpdate = () => {
    updateConfigMutation.mutate(systemConfig);
  };

  // Team handlers
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setTeamFormData({});
    setTeamModalOpen(true);
  };

  const handleEditTeam = (team: TeamWithDetails) => {
    setSelectedTeam(team);
    setTeamFormData({
      name: team.name,
      countryId: team.countryId,
      sportId: team.sportId,
      description: team.description || '',
    });
    setTeamModalOpen(true);
  };

  const handleTeamSubmit = () => {
    if (selectedTeam) {
      updateTeamMutation.mutate({ id: selectedTeam.id, data: teamFormData });
    } else {
      createTeamMutation.mutate(teamFormData as any);
    }
  };

  const handleDeleteTeam = (id: string) => {
    deleteTeamMutation.mutate(id);
  };

  // Venue handlers
  const handleCreateVenue = () => {
    setSelectedVenue(null);
    setVenueFormData({});
    setVenueModalOpen(true);
  };

  const handleEditVenue = (venue: VenueWithDetails) => {
    setSelectedVenue(venue);
    setVenueFormData({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      venueTypeId: venue.venueTypeId,
      description: venue.description || '',
      amenities: venue.amenities || [],
    });
    setVenueModalOpen(true);
  };

  const handleVenueSubmit = () => {
    if (selectedVenue) {
      updateVenueMutation.mutate({ id: selectedVenue.id, data: venueFormData });
    } else {
      createVenueMutation.mutate(venueFormData as any);
    }
  };

  const handleDeleteVenue = (id: string) => {
    deleteVenueMutation.mutate(id);
  };

  const handleDeleteBooking = (id: string) => {
    deleteBookingMutation.mutate(id);
  };

  const handleApproveBooking = (id: string) => {
    updateBookingMutation.mutate({ id, data: { status: 'approved' } });
  };

  const handleCancelBooking = (id: string) => {
    updateBookingMutation.mutate({ id, data: { status: 'cancelled' } });
  };

  // User CRUD mutations
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      toast({ title: "User Created", description: "User has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setUserModalOpen(false);
      setUserFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) => 
      apiRequest("PUT", `/api/users/${id}`, data),
    onSuccess: () => {
      toast({ title: "User Updated", description: "User has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setUserModalOpen(false);
      setSelectedUser(null);
      setUserFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      toast({ title: "User Deleted", description: "User has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Sports CRUD mutations
  const createSportMutation = useMutation({
    mutationFn: (data: InsertSport) => apiRequest("POST", "/api/sports", data),
    onSuccess: () => {
      toast({ title: "Sport Created", description: "Sport has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      setSportsModalOpen(false);
      setSportsFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateSportMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertSport> }) => 
      apiRequest("PUT", `/api/sports/${id}`, data),
    onSuccess: () => {
      toast({ title: "Sport Updated", description: "Sport has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      setSportsModalOpen(false);
      setSelectedSport(null);
      setSportsFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteSportMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/sports/${id}`),
    onSuccess: () => {
      toast({ title: "Sport Deleted", description: "Sport has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Countries CRUD mutations  
  const createCountryMutation = useMutation({
    mutationFn: (data: InsertCountry) => apiRequest("POST", "/api/countries", data),
    onSuccess: () => {
      toast({ title: "Country Created", description: "Country has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      setCountryModalOpen(false);
      setCountryFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateCountryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCountry> }) => 
      apiRequest("PUT", `/api/countries/${id}`, data),
    onSuccess: () => {
      toast({ title: "Country Updated", description: "Country has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      setCountryModalOpen(false);
      setSelectedCountry(null);
      setCountryFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteCountryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/countries/${id}`),
    onSuccess: () => {
      toast({ title: "Country Deleted", description: "Country has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Venue Type CRUD mutations
  const createVenueTypeMutation = useMutation({
    mutationFn: (data: Partial<InsertVenueType>) => 
      apiRequest("POST", "/api/venue-types", data),
    onSuccess: () => {
      toast({ title: "Venue Type Created", description: "Venue type has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/venue-types"] });
      setVenueTypeModalOpen(false);
      setVenueTypeFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateVenueTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertVenueType> }) => 
      apiRequest("PUT", `/api/venue-types/${id}`, data),
    onSuccess: () => {
      toast({ title: "Venue Type Updated", description: "Venue type has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/venue-types"] });
      setVenueTypeModalOpen(false);
      setSelectedVenueType(null);
      setVenueTypeFormData({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteVenueTypeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/venue-types/${id}`),
    onSuccess: () => {
      toast({ title: "Venue Type Deleted", description: "Venue type has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/venue-types"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // User handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserFormData({ role: 'customer' });
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      username: user.username,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      countryCode: user.countryCode || '',
      isActive: user.isActive,
    });
    setUserModalOpen(true);
  };

  const handleUserSubmit = () => {
    if (selectedUser) {
      // Don't send password when updating
      const { password, ...updateData } = userFormData;
      updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
    } else {
      createUserMutation.mutate(userFormData);
    }
  };

  const handleDeleteUser = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  // Sports handlers
  const handleCreateSport = () => {
    setSelectedSport(null);
    setSportsFormData({});
    setSportsModalOpen(true);
  };

  const handleEditSport = (sport: Sport) => {
    setSelectedSport(sport);
    setSportsFormData({
      name: sport.name,
      category: sport.category || '',
      description: sport.description || '',
    });
    setSportsModalOpen(true);
  };

  const handleSportSubmit = () => {
    if (selectedSport) {
      updateSportMutation.mutate({ id: selectedSport.id, data: sportsFormData });
    } else {
      createSportMutation.mutate(sportsFormData as InsertSport);
    }
  };

  const handleDeleteSport = (id: string) => {
    deleteSportMutation.mutate(id);
  };

  // Countries handlers
  const handleCreateCountry = () => {
    setSelectedCountry(null);
    setCountryFormData({});
    setCountryModalOpen(true);
  };

  const handleEditCountry = (country: Country) => {
    setSelectedCountry(country);
    setCountryFormData({
      name: country.name,
      code: country.code,
      flagUrl: country.flagUrl || '',
    });
    setCountryModalOpen(true);
  };

  const handleCountrySubmit = () => {
    if (selectedCountry) {
      updateCountryMutation.mutate({ id: selectedCountry.id, data: countryFormData });
    } else {
      createCountryMutation.mutate(countryFormData as InsertCountry);
    }
  };

  const handleDeleteCountry = (id: string) => {
    deleteCountryMutation.mutate(id);
  };

  // Venue type handlers
  const handleCreateVenueType = () => {
    setSelectedVenueType(null);
    setVenueTypeFormData({});
    setVenueTypeModalOpen(true);
  };

  const handleEditVenueType = (venueType: VenueType) => {
    setSelectedVenueType(venueType);
    setVenueTypeFormData({
      name: venueType.name,
      description: venueType.description || '',
    });
    setVenueTypeModalOpen(true);
  };

  const handleVenueTypeSubmit = () => {
    if (selectedVenueType) {
      updateVenueTypeMutation.mutate({ id: selectedVenueType.id, data: venueTypeFormData });
    } else {
      createVenueTypeMutation.mutate(venueTypeFormData as InsertVenueType);
    }
  };

  const handleDeleteVenueType = (id: string) => {
    deleteVenueTypeMutation.mutate(id);
  };

  if (isLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading SuperAdmin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto mobile-container py-4 sm:py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
              <p className="text-gray-600 mt-1">Complete system administration and configuration</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid mobile-stats-grid mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{allUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold">{(stats as any)?.activeBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Venues</p>
                  <p className="text-2xl font-bold">{venues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Permissions</p>
                  <p className="text-2xl font-bold">{permissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="system-config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-10 gap-1 h-auto p-1">
            <TabsTrigger value="system-config" data-testid="system-config-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Config</span>
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="teams-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="venues" data-testid="venues-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Database className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Venues</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="bookings-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Users</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="permissions-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Perms</span>
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="audit-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="sports" data-testid="sports-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Trophy className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Sports</span>
            </TabsTrigger>
            <TabsTrigger value="countries" data-testid="countries-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Flag className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">Countries</span>
            </TabsTrigger>
            <TabsTrigger value="venue-types" data-testid="venue-types-tab" className="mobile-tab flex flex-col sm:flex-row items-center gap-1">
              <Building className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">V.Types</span>
            </TabsTrigger>
          </TabsList>

          {/* System Configuration Tab */}
          <TabsContent value="system-config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Login Page Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loginHeading1">Login Heading 1</Label>
                      <Input
                        id="loginHeading1"
                        value={systemConfig.loginHeading1 || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, loginHeading1: e.target.value }))}
                        placeholder="Welcome to"
                        data-testid="login-heading-1-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="loginHeading2">Login Heading 2</Label>
                      <Input
                        id="loginHeading2"
                        value={systemConfig.loginHeading2 || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, loginHeading2: e.target.value }))}
                        placeholder="Bahrain Asian Youth Games 2025"
                        data-testid="login-heading-2-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="loginHeading3">Login Heading 3</Label>
                      <Input
                        id="loginHeading3"
                        value={systemConfig.loginHeading3 || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, loginHeading3: e.target.value }))}
                        placeholder="Training Management System"
                        data-testid="login-heading-3-input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={systemConfig.logoUrl || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        data-testid="logo-url-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="separatorImageUrl">Separator Image URL</Label>
                      <Input
                        id="separatorImageUrl"
                        value={systemConfig.separatorImageUrl || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, separatorImageUrl: e.target.value }))}
                        placeholder="https://example.com/separator.jpg"
                        data-testid="separator-image-input"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>SMTP Configuration (Office365)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={systemConfig.smtpHost || ''}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                          placeholder="smtp.office365.com"
                          data-testid="smtp-host-input"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                        <Input
                          id="smtpUsername"
                          value={systemConfig.smtpUsername || ''}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                          placeholder="your-email@domain.com"
                          data-testid="smtp-username-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="smtpFromEmail">From Email</Label>
                        <Input
                          id="smtpFromEmail"
                          value={systemConfig.smtpFromEmail || ''}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, smtpFromEmail: e.target.value }))}
                          placeholder="noreply@domain.com"
                          data-testid="smtp-from-email-input"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="smtpFromName">From Name</Label>
                        <Input
                          id="smtpFromName"
                          value={systemConfig.smtpFromName || ''}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, smtpFromName: e.target.value }))}
                          placeholder="Training Management System"
                          data-testid="smtp-from-name-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Booking Duration Configuration</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="twoHourLimitEnabled"
                          checked={systemConfig.twoHourLimitEnabled ?? true}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, twoHourLimitEnabled: e.target.checked }))}
                          className="rounded border-gray-300"
                          data-testid="two-hour-limit-checkbox"
                        />
                        <Label htmlFor="twoHourLimitEnabled">Enable 2-Hour Booking Limit</Label>
                      </div>
                      <p className="text-sm text-gray-600">
                        When enabled, bookings are limited to a maximum of 2 hours per session.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="maxBookingDuration">Maximum Booking Duration (hours)</Label>
                        <Input
                          id="maxBookingDuration"
                          type="number"
                          min="1"
                          max="8"
                          value={systemConfig.maxBookingDuration || 2}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, maxBookingDuration: parseInt(e.target.value) || 2 }))}
                          placeholder="2"
                          disabled={!systemConfig.twoHourLimitEnabled}
                          data-testid="max-duration-input"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Set custom maximum duration when limit is enabled (1-8 hours).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleConfigUpdate}
                    disabled={updateConfigMutation.isPending}
                    data-testid="update-config-button"
                  >
                    {updateConfigMutation.isPending ? "Updating..." : "Update Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Management Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Teams Management</span>
                  </CardTitle>
                  <Button onClick={handleCreateTeam} data-testid="create-team-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Sport</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell className="font-medium">{team.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Flag className="w-4 h-4" />
                              <span>{team.country?.name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{team.sport?.name || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{team.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTeam(team)}
                                data-testid={`edit-team-${team.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`delete-team-${team.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Team</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{team.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTeam(team.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Teams Found</p>
                    <p className="text-muted-foreground mb-4">
                      Create your first team to get started.
                    </p>
                    <Button onClick={handleCreateTeam}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Venues Management Tab */}
          <TabsContent value="venues" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Venues Management</span>
                  </CardTitle>
                  <Button onClick={handleCreateVenue} data-testid="create-venue-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {venues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venues.map((venue) => (
                        <TableRow key={venue.id}>
                          <TableCell className="font-medium">{venue.name}</TableCell>
                          <TableCell>{venue.location}</TableCell>
                          <TableCell>{venue.capacity}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {venue.venueType?.name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVenue(venue)}
                                data-testid={`edit-venue-${venue.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`delete-venue-${venue.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{venue.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteVenue(venue.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Venues Found</p>
                    <p className="text-muted-foreground mb-4">
                      Create your first venue to get started.
                    </p>
                    <Button onClick={handleCreateVenue}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Venue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Management Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Bookings Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venue</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.venue?.name || 'N/A'}</TableCell>
                          <TableCell>{booking.team?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(booking.startDateTime).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                {new Date(booking.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(booking.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {Math.round((new Date(booking.endDateTime).getTime() - new Date(booking.startDateTime).getTime()) / (1000 * 60 * 60 * 100)) / 10}h
                          </TableCell>
                          <TableCell>
                            <Badge variant={booking.status === 'approved' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {/* Approve Button - Only show for pending bookings */}
                              {booking.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApproveBooking(booking.id)}
                                  data-testid={`approve-booking-${booking.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {/* Cancel Button - Only show for pending or approved bookings */}
                              {(booking.status === 'pending' || booking.status === 'approved') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  data-testid={`cancel-booking-${booking.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`delete-booking-${booking.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this booking? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBooking(booking.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</p>
                    <p className="text-muted-foreground">
                      Bookings will appear here once teams start making reservations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Users Management (NOCs)</span>
                  </CardTitle>
                  <Button onClick={handleCreateUser} data-testid="create-user-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {allUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium">{userItem.username}</TableCell>
                          <TableCell>
                            {userItem.firstName && userItem.lastName 
                              ? `${userItem.firstName} ${userItem.lastName}`
                              : '-'
                            }
                          </TableCell>
                          <TableCell>{userItem.email || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={userItem.role === 'superadmin' ? 'default' : userItem.role === 'manager' ? 'secondary' : 'outline'}>
                              {userItem.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Flag className="w-4 h-4" />
                              <span>{userItem.countryCode || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userItem.isActive ? 'default' : 'secondary'}>
                              {userItem.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(userItem)}
                                data-testid={`edit-user-${userItem.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {userItem.id !== user?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      data-testid={`delete-user-${userItem.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{userItem.username}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(userItem.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Users Found</p>
                    <p className="text-muted-foreground mb-4">
                      Create your first NOC user to get started.
                    </p>
                    <Button onClick={handleCreateUser}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {permissions.length > 0 ? (
                    permissions.map(permission => (
                      <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{permission.role}</h4>
                          <p className="text-sm text-gray-600">Dashboard: {permission.dashboardType}</p>
                        </div>
                        <Badge variant={permission.canAccess ? "default" : "secondary"}>
                          {permission.canAccess ? "Allowed" : "Denied"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No Permissions Configured</p>
                      <p className="text-muted-foreground">
                        Dashboard permissions will appear here once configured.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Audit Logs</p>
                  <p className="text-muted-foreground">
                    System audit logs will be displayed here for compliance tracking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sports Management Tab */}
          <TabsContent value="sports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Sports Management</span>
                  </div>
                  <Button onClick={handleCreateSport} data-testid="create-sport-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sport
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sports.map((sport) => (
                        <TableRow key={sport.id} data-testid={`sport-row-${sport.id}`}>
                          <TableCell className="font-medium">{sport.name}</TableCell>
                          <TableCell>{sport.category || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{sport.description || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={sport.isActive ? "default" : "secondary"}>
                              {sport.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSport(sport)}
                                data-testid={`edit-sport-${sport.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`delete-sport-${sport.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Sport</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{sport.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSport(sport.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {sports.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No Sports Found</p>
                            <p className="text-muted-foreground mb-4">
                              Start by creating your first sport category.
                            </p>
                            <Button onClick={handleCreateSport}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Sport
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Countries Management Tab */}
          <TabsContent value="countries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flag className="w-5 h-5" />
                    <span>Countries Management</span>
                  </div>
                  <Button onClick={handleCreateCountry} data-testid="create-country-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Country
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Flag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countries.map((country) => (
                        <TableRow key={country.id} data-testid={`country-row-${country.id}`}>
                          <TableCell className="font-medium">{country.name}</TableCell>
                          <TableCell>{country.code}</TableCell>
                          <TableCell>
                            {country.flagUrl ? (
                              <img src={country.flagUrl} alt={`${country.name} flag`} className="w-8 h-6 object-cover rounded" />
                            ) : (
                              <span className="text-muted-foreground">No flag</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={country.isActive ? "default" : "secondary"}>
                              {country.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCountry(country)}
                                data-testid={`edit-country-${country.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`delete-country-${country.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Country</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{country.name}"? This action cannot be undone and may affect existing teams.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCountry(country.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {countries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No Countries Found</p>
                            <p className="text-muted-foreground mb-4">
                              Start by creating your first country.
                            </p>
                            <Button onClick={handleCreateCountry}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Country
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Venue Types Management Tab */}
          <TabsContent value="venue-types" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Venue Types Management</span>
                  </CardTitle>
                  <Button onClick={handleCreateVenueType} data-testid="create-venue-type-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {venueTypes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venueTypes.map((venueType) => (
                        <TableRow key={venueType.id}>
                          <TableCell className="font-medium">{venueType.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{venueType.description || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={venueType.isActive ? "default" : "secondary"}>
                              {venueType.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVenueType(venueType)}
                                data-testid={`edit-venue-type-${venueType.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`delete-venue-type-${venueType.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Venue Type</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{venueType.name}"? This action cannot be undone and may affect existing venues.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteVenueType(venueType.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Venue Types Found</p>
                    <p className="text-muted-foreground mb-4">
                      Create your first venue type to categorize venues.
                    </p>
                    <Button onClick={handleCreateVenueType}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Venue Type
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Modal */}
      <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
            <DialogDescription>
              {selectedTeam ? 'Update the team information below.' : 'Fill in the details to create a new team.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamFormData.name || ''}
                onChange={(e) => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                data-testid="team-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team-country">Country</Label>
                <Select
                  value={teamFormData.countryId || ''}
                  onValueChange={(value) => setTeamFormData(prev => ({ ...prev, countryId: value }))}
                >
                  <SelectTrigger data-testid="team-country-select">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-sport">Sport</Label>
                <Select
                  value={teamFormData.sportId || ''}
                  onValueChange={(value) => setTeamFormData(prev => ({ ...prev, sportId: value }))}
                >
                  <SelectTrigger data-testid="team-sport-select">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={teamFormData.description || ''}
                onChange={(e) => setTeamFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter team description"
                rows={3}
                data-testid="team-description-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTeamSubmit}
              disabled={!teamFormData.name || !teamFormData.countryId || !teamFormData.sportId || createTeamMutation.isPending || updateTeamMutation.isPending}
              data-testid="team-submit-button"
            >
              {selectedTeam ? 'Update Team' : 'Create Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Venue Modal */}
      <Dialog open={venueModalOpen} onOpenChange={setVenueModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedVenue ? 'Edit Venue' : 'Create New Venue'}</DialogTitle>
            <DialogDescription>
              {selectedVenue ? 'Update the venue information below.' : 'Fill in the details to create a new venue.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue-name">Venue Name</Label>
                <Input
                  id="venue-name"
                  value={venueFormData.name || ''}
                  onChange={(e) => setVenueFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter venue name"
                  data-testid="venue-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-type">Venue Type</Label>
                <Select
                  value={venueFormData.venueTypeId || ''}
                  onValueChange={(value) => setVenueFormData(prev => ({ ...prev, venueTypeId: value }))}
                >
                  <SelectTrigger data-testid="venue-type-select">
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueTypes.map((venueType) => (
                      <SelectItem key={venueType.id} value={venueType.id}>
                        {venueType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue-capacity">Capacity</Label>
                <Input
                  id="venue-capacity"
                  type="number"
                  value={venueFormData.capacity || ''}
                  onChange={(e) => setVenueFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter capacity"
                  data-testid="venue-capacity-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-location">Location</Label>
                <Input
                  id="venue-location"
                  value={venueFormData.location || ''}
                  onChange={(e) => setVenueFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter venue location"
                  data-testid="venue-location-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-description">Description</Label>
              <Textarea
                id="venue-description"
                value={venueFormData.description || ''}
                onChange={(e) => setVenueFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter venue description"
                rows={3}
                data-testid="venue-description-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVenueModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleVenueSubmit}
              disabled={!venueFormData.name || !venueFormData.venueTypeId || !venueFormData.location || !venueFormData.capacity || createVenueMutation.isPending || updateVenueMutation.isPending}
              data-testid="venue-submit-button"
            >
              {selectedVenue ? 'Update Venue' : 'Create Venue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Update the user information below.' : 'Fill in the details to create a new NOC user.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-username">Username</Label>
                <Input
                  id="user-username"
                  value={userFormData.username || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  disabled={!!selectedUser}
                  data-testid="user-username-input"
                />
              </div>
              {!selectedUser && (
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={userFormData.password || ''}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    data-testid="user-password-input"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-firstName">First Name</Label>
                <Input
                  id="user-firstName"
                  value={userFormData.firstName || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  data-testid="user-firstname-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-lastName">Last Name</Label>
                <Input
                  id="user-lastName"
                  value={userFormData.lastName || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  data-testid="user-lastname-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={userFormData.email || ''}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                data-testid="user-email-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={userFormData.role || 'customer'}
                  onValueChange={(value) => setUserFormData(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger data-testid="user-role-select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer (NOC)</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="superadmin">SuperAdmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-country">Country Code</Label>
                <Select
                  value={userFormData.countryCode || ''}
                  onValueChange={(value) => setUserFormData(prev => ({ ...prev, countryCode: value }))}
                >
                  <SelectTrigger data-testid="user-country-select">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedUser && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="user-active"
                  checked={userFormData.isActive ?? true}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                  data-testid="user-active-checkbox"
                />
                <Label htmlFor="user-active">User is Active</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUserSubmit}
              disabled={
                !userFormData.username || 
                (!selectedUser && !userFormData.password) ||
                createUserMutation.isPending || 
                updateUserMutation.isPending
              }
              data-testid="user-submit-button"
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sports Modal */}
      <Dialog open={sportsModalOpen} onOpenChange={setSportsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedSport ? 'Edit Sport' : 'Create New Sport'}</DialogTitle>
            <DialogDescription>
              {selectedSport ? 'Update the sport information below.' : 'Fill in the details to create a new sport.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sport-name">Sport Name *</Label>
              <Input
                id="sport-name"
                value={sportsFormData.name || ''}
                onChange={(e) => setSportsFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter sport name"
                data-testid="sport-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sport-category">Category</Label>
              <Input
                id="sport-category"
                value={sportsFormData.category || ''}
                onChange={(e) => setSportsFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Aquatics, Athletics"
                data-testid="sport-category-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sport-description">Description</Label>
              <Textarea
                id="sport-description"
                value={sportsFormData.description || ''}
                onChange={(e) => setSportsFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter sport description"
                data-testid="sport-description-input"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSportsModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSportSubmit}
              disabled={!sportsFormData.name || createSportMutation.isPending || updateSportMutation.isPending}
              data-testid="sport-submit-button"
            >
              {selectedSport ? 'Update Sport' : 'Create Sport'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Countries Modal */}
      <Dialog open={countryModalOpen} onOpenChange={setCountryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedCountry ? 'Edit Country' : 'Create New Country'}</DialogTitle>
            <DialogDescription>
              {selectedCountry ? 'Update the country information below.' : 'Fill in the details to create a new country.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="country-name">Country Name *</Label>
              <Input
                id="country-name"
                value={countryFormData.name || ''}
                onChange={(e) => setCountryFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter country name"
                data-testid="country-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country-code">Country Code *</Label>
              <Input
                id="country-code"
                value={countryFormData.code || ''}
                onChange={(e) => setCountryFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., BHR, USA"
                maxLength={3}
                data-testid="country-code-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country-flag">Flag URL</Label>
              <Input
                id="country-flag"
                value={countryFormData.flagUrl || ''}
                onChange={(e) => setCountryFormData(prev => ({ ...prev, flagUrl: e.target.value }))}
                placeholder="Enter flag image URL"
                data-testid="country-flag-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCountryModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCountrySubmit}
              disabled={
                !countryFormData.name || 
                !countryFormData.code || 
                createCountryMutation.isPending || 
                updateCountryMutation.isPending
              }
              data-testid="country-submit-button"
            >
              {selectedCountry ? 'Update Country' : 'Create Country'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Venue Type Modal */}
      <Dialog open={venueTypeModalOpen} onOpenChange={setVenueTypeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedVenueType ? 'Edit Venue Type' : 'Create New Venue Type'}</DialogTitle>
            <DialogDescription>
              {selectedVenueType ? 'Update the venue type information below.' : 'Fill in the details to create a new venue type.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="venue-type-name">Venue Type Name *</Label>
              <Input
                id="venue-type-name"
                value={venueTypeFormData.name || ''}
                onChange={(e) => setVenueTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter venue type name (e.g., Stadium, Pool, Court)"
                data-testid="venue-type-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-type-description">Description</Label>
              <Textarea
                id="venue-type-description"
                value={venueTypeFormData.description || ''}
                onChange={(e) => setVenueTypeFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter venue type description"
                data-testid="venue-type-description-input"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVenueTypeModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleVenueTypeSubmit}
              disabled={!venueTypeFormData.name || createVenueTypeMutation.isPending || updateVenueTypeMutation.isPending}
              data-testid="venue-type-submit-button"
            >
              {selectedVenueType ? 'Update Venue Type' : 'Create Venue Type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}