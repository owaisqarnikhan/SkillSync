import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MapPin,
  Users,
  Clock,
  Waves,
  Footprints,
  CircleDot,
  Activity,
  Dumbbell,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Upload,
  Image
} from "lucide-react";
import type { VenueWithDetails, BookingWithDetails, InsertVenue, VenueType } from "@shared/schema";
import BookingModal from "@/components/BookingModal";
import { ObjectUploader } from "@/components/ObjectUploader";
import { format, startOfDay, endOfDay } from "date-fns";
import type { UploadResult } from "@uppy/core";

const venueIcons: Record<string, any> = {
  'Swimming Pool': Waves,
  'Athletics Track': Footprints,
  'Basketball Court': CircleDot,
  'Volleyball Court': Activity,
  'Badminton Hall': Activity,
  'Tennis Court': CircleDot,
  'Football Field': CircleDot,
  'Gym': Dumbbell,
  'Pool': Waves,
  'Track': Footprints,
  'Court': CircleDot,
  'Hall': Activity,
  'Field': CircleDot,
};

// Dynamic venue type labels - will be populated from API

export default function Venues() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string>();
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<InsertVenue>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: venues = [], isLoading: venuesLoading } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
    enabled: isAuthenticated,
  });

  const { data: venueTypes = [] } = useQuery<VenueType[]>({
    queryKey: ["/api/venue-types"],
    enabled: isAuthenticated,
  });

  const today = new Date();
  const { data: todayBookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings", {
      startDate: format(startOfDay(today), "yyyy-MM-dd"),
      endDate: format(endOfDay(today), "yyyy-MM-dd"),
    }],
    enabled: isAuthenticated,
  });

  // Mutations
  const updateVenueMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<InsertVenue> }) =>
      apiRequest("PUT", `/api/venues/${data.id}`, data.updates),
    onSuccess: () => {
      toast({
        title: "Venue Updated",
        description: "Venue has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setEditModalOpen(false);
      setSelectedVenue(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: (venueId: string) => apiRequest("DELETE", `/api/venues/${venueId}`),
    onSuccess: () => {
      toast({
        title: "Venue Deleted",
        description: "Venue has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getVenueAvailability = (venue: VenueWithDetails) => {
    const venueBookings = todayBookings.filter(
      booking => booking.venueId === venue.id && 
      ['approved', 'pending', 'requested'].includes(booking.status)
    );

    // Calculate rough availability based on working hours and bookings
    const workingStart = venue.workingStartTime || "06:00";
    const workingEnd = venue.workingEndTime || "22:00";
    const [startHour] = workingStart.split(':').map(Number);
    const [endHour] = workingEnd.split(':').map(Number);
    const totalHours = endHour - startHour;
    const maxSlots = Math.floor(totalHours / 2); // Assuming 2-hour slots
    
    const occupiedSlots = venueBookings.length;
    const availableSlots = Math.max(0, maxSlots - occupiedSlots);

    if (availableSlots === 0) {
      return { status: 'booked', label: 'Fully Booked', color: 'destructive' };
    } else if (availableSlots <= 2) {
      return { status: 'limited', label: 'Limited', color: 'secondary' };
    } else {
      return { status: 'available', label: 'Available', color: 'default' };
    }
  };

  // Get venue type name helper
  const getVenueTypeName = (typeId: string) => {
    const venueType = venueTypes.find(vt => vt.id === typeId);
    return venueType?.name || 'Unknown Type';
  };

  // Filter venues based on type and search term
  const filteredVenues = venues.filter(venue => {
    const typeMatch = typeFilter === "all" || venue.venueTypeId === typeFilter;
    const searchMatch = searchTerm === "" || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const handleBookVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    setBookingModalOpen(true);
  };

  // Handle edit venue
  const handleEditVenue = (venue: VenueWithDetails) => {
    setSelectedVenue(venue);
    setEditFormData({
      name: venue.name,
      venueTypeId: venue.venueTypeId,
      location: venue.location || '',
      capacity: venue.capacity,
      description: venue.description || '',
      amenities: venue.amenities || [],
      workingStartTime: venue.workingStartTime,
      workingEndTime: venue.workingEndTime,
      bufferTimeMinutes: venue.bufferTimeMinutes,
      imageUrl: venue.imageUrl || '',
      attachmentUrl: venue.attachmentUrl || '',
    });
    setEditModalOpen(true);
  };

  // Handle delete venue
  const handleDeleteVenue = (venueId: string) => {
    deleteVenueMutation.mutate(venueId);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedVenue) return;
    updateVenueMutation.mutate({
      id: selectedVenue.id,
      updates: editFormData,
    });
  };

  // Check permissions
  const canEdit = (venue: VenueWithDetails) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'manager' && venue.managerId === user.id) return true;
    return false;
  };

  const canDelete = () => {
    return user?.role === 'superadmin';
  };

  // Image upload handlers
  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return {
        method: data.isLocalFallback ? "POST" as const : "PUT" as const,
        url: data.uploadURL,
        uploadURL: data.uploadURL,
        isLocalFallback: data.isLocalFallback,
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImageUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploading(true);
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        // Update the form data with the new image URL
        setEditFormData(prev => ({ ...prev, imageUrl: uploadURL }));
        
        toast({
          title: "Image Uploaded",
          description: "Venue image has been uploaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload venue image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploadingAttachment(true);
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        // Update the form data with the new attachment URL
        setEditFormData(prev => ({ ...prev, attachmentUrl: uploadURL }));
        
        toast({
          title: "Attachment Uploaded",
          description: "Venue attachment has been uploaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload venue attachment",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Venues</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Browse and book training venues for your team</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search venues by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-venues-input"
                />
              </div>
              <div className="sm:w-44 lg:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger data-testid="type-filter-select">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {venueTypes.map((venueType) => (
                      <SelectItem key={venueType.id} value={venueType.id}>
                        {venueType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venues Grid */}
        {venuesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading venues...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {venues.length === 0 ? "No venues available" : "No venues match your filters"}
              </p>
              <p className="text-muted-foreground">
                {venues.length === 0 
                  ? "Please contact your administrator to add venues."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVenues.map((venue) => {
              const venueTypeName = venue.venueType?.name || getVenueTypeName(venue.venueTypeId);
              const Icon = venueIcons[venueTypeName] || MapPin;
              const availability = getVenueAvailability(venue);

              return (
                <Card key={venue.id} className="hover:shadow-lg transition-shadow" data-testid={`venue-card-${venue.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {venue.imageUrl ? (
                            <img 
                              src={venue.imageUrl}
                              alt={venue.name}
                              className="w-full h-full object-cover rounded-lg"
                              data-testid={`venue-image-${venue.id}`}
                            />
                          ) : (
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate" data-testid={`venue-name-${venue.id}`}>
                            {venue.name}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {getVenueTypeName(venue.venueTypeId)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={availability.color as any}
                        className={`text-xs flex-shrink-0 ${
                          availability.status === 'available' ? 'bg-success/10 text-success hover:bg-success/20' :
                          availability.status === 'limited' ? 'bg-warning/10 text-warning hover:bg-warning/20' :
                          'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        }`}
                      >
                        {availability.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Venue details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Capacity: {venue.capacity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {venue.workingStartTime || "06:00"} - {venue.workingEndTime || "22:00"}
                          </span>
                        </div>
                      </div>

                      {venue.location && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{venue.location}</span>
                        </div>
                      )}

                      {venue.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {venue.description}
                        </p>
                      )}

                      {venue.amenities && venue.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {venue.amenities.slice(0, 2).map((amenity, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {venue.amenities.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{venue.amenities.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => handleBookVenue(venue.id)}
                          disabled={availability.status === 'booked'}
                          data-testid={`book-venue-${venue.id}`}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {availability.status === 'booked' ? 'Fully Booked' : 'Book Now'}
                        </Button>
                        
                        {user?.role !== 'customer' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`venue-actions-${venue.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditVenue(venue)}
                                disabled={!canEdit(venue)}
                                data-testid={`edit-venue-${venue.id}`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Venue
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteVenue(venue.id)}
                                disabled={!canDelete()}
                                className="text-destructive"
                                data-testid={`delete-venue-${venue.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Venue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal
          isOpen={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          selectedVenueId={selectedVenueId}
        />

        {/* Edit Venue Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Venue</DialogTitle>
              <DialogDescription>
                Make changes to the venue information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Venue Image Upload */}
              <div className="grid gap-2">
                <Label>Venue Image</Label>
                <div className="space-y-3">
                  {editFormData.imageUrl ? (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={editFormData.imageUrl}
                        alt="Venue preview"
                        className="w-full h-full object-cover"
                        data-testid="venue-image-preview"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No image uploaded</p>
                      </div>
                    </div>
                  )}
                  
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880} // 5MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleImageUploadComplete}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? "Uploading..." : "Upload Venue Image"}</span>
                    </div>
                  </ObjectUploader>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Venue Name</Label>
                <Input
                  id="name"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  data-testid="edit-venue-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Venue Type</Label>
                <Select
                  value={editFormData.venueTypeId || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, venueTypeId: value })}
                >
                  <SelectTrigger data-testid="edit-venue-type">
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
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editFormData.location || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  data-testid="edit-venue-location"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={editFormData.capacity || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) || 0 })}
                  data-testid="edit-venue-capacity"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="workingStartTime">Start Time</Label>
                  <Input
                    id="workingStartTime"
                    type="time"
                    value={editFormData.workingStartTime || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, workingStartTime: e.target.value })}
                    data-testid="edit-venue-start-time"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workingEndTime">End Time</Label>
                  <Input
                    id="workingEndTime"
                    type="time"
                    value={editFormData.workingEndTime || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, workingEndTime: e.target.value })}
                    data-testid="edit-venue-end-time"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  data-testid="edit-venue-description"
                />
              </div>
              
              {/* Venue Attachment Upload */}
              <div className="grid gap-2">
                <Label>Additional Attachments</Label>
                <div className="space-y-3">
                  {editFormData.attachmentUrl && (
                    <div className="text-sm text-muted-foreground">
                      <a 
                        href={editFormData.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Current Attachment
                      </a>
                    </div>
                  )}
                  
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760} // 10MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleAttachmentUploadComplete}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingAttachment ? "Uploading..." : "Upload Attachment"}</span>
                    </div>
                  </ObjectUploader>
                  
                  <div className="text-xs text-muted-foreground">
                    Upload additional documents, floor plans, or other venue-related files
                  </div>
                </div>
              </div>
              
              {/* Image URL field for direct URL input */}
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={editFormData.imageUrl || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  placeholder="Enter direct image URL"
                  data-testid="edit-venue-image-url"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                data-testid="cancel-edit-venue"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateVenueMutation.isPending}
                data-testid="save-edit-venue"
              >
                {updateVenueMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
