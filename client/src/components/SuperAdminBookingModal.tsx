import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface SuperAdminBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConflictResponse {
  hasConflict: boolean;
  conflictingBookings: any[];
  suggestedSlots: {
    startDateTime: string;
    endDateTime: string;
    venueId: string;
    venueName: string;
  }[];
}

export default function SuperAdminBookingModal({ open, onOpenChange }: SuperAdminBookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "admin_override">("high");
  
  // Conflict handling state
  const [conflicts, setConflicts] = useState<ConflictResponse | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Data queries
  const { data: teams = [] } = useQuery({
    queryKey: ["/api/teams"],
    enabled: open,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["/api/venues"],
    enabled: open,
  });

  // Check conflicts mutation
  const checkConflictsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/admin/bookings/check-conflicts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to check conflicts");
      }
      return response.json();
    },
    onSuccess: (data: ConflictResponse) => {
      setConflicts(data);
      if (data.hasConflict) {
        setShowConflicts(true);
      } else {
        // No conflicts, proceed with booking
        createBookingMutation.mutate({ forceOverride: false });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check booking conflicts.",
        variant: "destructive",
      });
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: { forceOverride: boolean }) => {
      const bookingData = {
        teamId: selectedTeam,
        venueId: selectedVenue,
        startDateTime,
        endDateTime,
        purpose: purpose || null,
        notes: notes || null,
        participantCount: participantCount ? parseInt(participantCount) : null,
        specialRequirements: specialRequirements || null,
        priority,
        forceOverride: data.forceOverride,
      };

      const response = await apiRequest("/api/admin/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: data.message || "Admin booking created successfully.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    // Reset form
    setSelectedTeam("");
    setSelectedVenue("");
    setStartDateTime("");
    setEndDateTime("");
    setPurpose("");
    setNotes("");
    setParticipantCount("");
    setSpecialRequirements("");
    setPriority("high");
    setConflicts(null);
    setShowConflicts(false);
    setSelectedSuggestion(null);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!selectedTeam || !selectedVenue || !startDateTime || !endDateTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for conflicts first
    checkConflictsMutation.mutate({
      venueId: selectedVenue,
      startDateTime,
      endDateTime,
    });
  };

  const handleForceOverride = () => {
    createBookingMutation.mutate({ forceOverride: true });
  };

  const handleUseSuggestion = (suggestion: any) => {
    setSelectedVenue(suggestion.venueId);
    setStartDateTime(suggestion.startDateTime);
    setEndDateTime(suggestion.endDateTime);
    setShowConflicts(false);
    setConflicts(null);
    
    toast({
      title: "Suggestion Applied",
      description: `Venue and time updated to ${suggestion.venueName}`,
    });
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((t: any) => t.id === teamId);
    return team ? `${team.name} (${team.country.name})` : "";
  };

  const getVenueName = (venueId: string) => {
    const venue = venues.find((v: any) => v.id === venueId);
    return venue ? venue.name : "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Super Admin Booking
          </DialogTitle>
        </DialogHeader>

        {!showConflicts ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team">Team *</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.country.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue: any) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDateTime">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDateTime">End Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participantCount">Participant Count</Label>
                <Input
                  type="number"
                  value={participantCount}
                  onChange={(e) => setParticipantCount(e.target.value)}
                  placeholder="Number of participants"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="admin_override">Admin Override</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Training purpose (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any special requirements..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={checkConflictsMutation.isPending || createBookingMutation.isPending}
              >
                {checkConflictsMutation.isPending ? "Checking Conflicts..." : "Create Booking"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conflict Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Booking Conflict Detected!</strong>
                <br />
                The selected time slot conflicts with existing bookings. Choose an option below:
              </AlertDescription>
            </Alert>

            {/* Current Booking Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Your Booking Request:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Team:</strong> {getTeamName(selectedTeam)}
                </div>
                <div>
                  <strong>Venue:</strong> {getVenueName(selectedVenue)}
                </div>
                <div>
                  <strong>Start:</strong> {format(new Date(startDateTime), "PPp")}
                </div>
                <div>
                  <strong>End:</strong> {format(new Date(endDateTime), "PPp")}
                </div>
              </div>
            </div>

            {/* Conflicting Bookings */}
            {conflicts?.conflictingBookings && conflicts.conflictingBookings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Conflicting Bookings:</h4>
                <div className="space-y-2">
                  {conflicts.conflictingBookings.map((booking: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{booking.team.name} ({booking.team.country.name})</div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(booking.startDateTime), "PPp")} - {format(new Date(booking.endDateTime), "PPp")}
                          </div>
                          {booking.purpose && (
                            <div className="text-sm text-gray-500">Purpose: {booking.purpose}</div>
                          )}
                        </div>
                        <Badge variant={booking.isAdminBooking ? "destructive" : "secondary"}>
                          {booking.isAdminBooking ? "Admin Booking" : "Regular Booking"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Alternatives */}
            {conflicts?.suggestedSlots && conflicts.suggestedSlots.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Suggested Alternative Slots:</h4>
                <div className="space-y-2">
                  {conflicts.suggestedSlots.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSuggestion === `${index}` 
                          ? "bg-green-50 border-green-200" 
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedSuggestion(`${index}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {suggestion.venueName}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(suggestion.startDateTime), "PPp")} - {format(new Date(suggestion.endDateTime), "PPp")}
                          </div>
                        </div>
                        {selectedSuggestion === `${index}` && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowConflicts(false)}>
                Back to Edit
              </Button>
              
              {selectedSuggestion !== null && (
                <Button 
                  onClick={() => handleUseSuggestion(conflicts!.suggestedSlots[parseInt(selectedSuggestion)])}
                  variant="outline"
                >
                  Use Selected Suggestion
                </Button>
              )}
              
              <Button 
                onClick={handleForceOverride}
                variant="destructive"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? "Creating..." : "Force Override"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}