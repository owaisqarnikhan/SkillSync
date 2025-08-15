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
  DialogTrigger,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users,
  MapPin,
  Trophy,
  User,
  Flag,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Plus
} from "lucide-react";
import type { TeamWithDetails, Country, InsertTeam } from "@shared/schema";

export default function Teams() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<InsertTeam>>({});

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

  const { data: teams = [], isLoading: teamsLoading } = useQuery<TeamWithDetails[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated,
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
    enabled: isAuthenticated,
  });

  // Sports query removed - teams now store sport as string field directly

  // Mutations
  const updateTeamMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<InsertTeam> }) =>
      apiRequest("PUT", `/api/teams/${data.id}`, data.updates),
    onSuccess: () => {
      toast({
        title: "Team Updated",
        description: "Team has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setEditModalOpen(false);
      setSelectedTeam(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: string) => apiRequest("DELETE", `/api/teams/${teamId}`),
    onSuccess: () => {
      toast({
        title: "Team Deleted",
        description: "Team has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter teams based on country, sport, and search term
  const filteredTeams = teams.filter(team => {
    const countryMatch = countryFilter === "all" || team.country.code === countryFilter;
    const sportMatch = sportFilter === "all" || (team.sport && team.sport.toLowerCase().includes(sportFilter.toLowerCase()));
    const searchMatch = searchTerm === "" || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.sport && team.sport.toLowerCase().includes(searchTerm.toLowerCase()));
    return countryMatch && sportMatch && searchMatch;
  });

  // Handle edit team
  const handleEditTeam = (team: TeamWithDetails) => {
    setSelectedTeam(team);
    setEditFormData({
      name: team.name,
      countryId: team.countryId,
      sport: team.sport,
      category: team.category,
      managerId: team.managerId || undefined,
      memberCount: team.memberCount,
      description: team.description || '',
    });
    setEditModalOpen(true);
  };

  // Handle delete team
  const handleDeleteTeam = (teamId: string) => {
    deleteTeamMutation.mutate(teamId);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedTeam) return;
    updateTeamMutation.mutate({
      id: selectedTeam.id,
      updates: editFormData,
    });
  };

  // Check permissions
  const canEdit = (team: TeamWithDetails) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'manager' && team.managerId === user.id) return true;
    return false;
  };

  const canDelete = () => {
    return user?.role === 'superadmin';
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Browse participating teams from across Asia
            {user?.role === 'customer' && user.countryCode && ` - Showing teams from ${user.countryCode}`}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search teams, countries, or sports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-teams-input"
                />
              </div>
              <div className="sm:w-44 lg:w-48">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger data-testid="country-filter-select">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-40 lg:w-44">
                <Input
                  placeholder="Filter by sport"
                  value={sportFilter === "all" ? "" : sportFilter}
                  onChange={(e) => setSportFilter(e.target.value || "all")}
                  data-testid="sport-filter-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        {teamsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {teams.length === 0 ? "No teams found" : "No teams match your filters"}
              </p>
              <p className="text-muted-foreground">
                {teams.length === 0 
                  ? "Teams will appear here once they are registered for the games."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow" data-testid={`team-card-${team.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {team.country.flagUrl ? (
                        <img 
                          src={team.country.flagUrl} 
                          alt={`${team.country.name} flag`}
                          className="w-6 h-4 sm:w-8 sm:h-6 object-cover rounded"
                        />
                      ) : (
                        <Flag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate" data-testid={`team-name-${team.id}`}>
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs truncate max-w-20 sm:max-w-none">
                          {team.country.name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs truncate max-w-16 sm:max-w-none">
                          {team.sport || 'No sport'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Team stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {team.memberCount} members
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {team.category || 'Sports'}
                        </span>
                      </div>
                    </div>

                    {/* Team manager */}
                    {team.manager && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Manager: {team.manager.firstName && team.manager.lastName 
                            ? `${team.manager.firstName} ${team.manager.lastName}`
                            : team.manager.email
                          }
                        </span>
                      </div>
                    )}

                    {/* Team description */}
                    {team.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {team.description}
                      </p>
                    )}

                    {/* Status indicator */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge 
                        variant={team.isActive ? "default" : "secondary"}
                        className={team.isActive ? "bg-success/10 text-success" : ""}
                      >
                        {team.isActive ? "Active" : "Inactive"}
                      </Badge>
                      
                      {user?.role !== 'customer' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" data-testid={`team-actions-${team.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditTeam(team)}
                              disabled={!canEdit(team)}
                              data-testid={`edit-team-${team.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Team
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTeam(team.id)}
                              disabled={!canDelete()}
                              className="text-destructive"
                              data-testid={`delete-team-${team.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {filteredTeams.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Teams Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{filteredTeams.length}</p>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">
                    {new Set(filteredTeams.map(t => t.country.id)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">
                    {new Set(filteredTeams.map(t => t.sport).filter(s => s)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Sports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Team Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>
                Make changes to the team information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  data-testid="edit-team-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={editFormData.countryId || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, countryId: value })}
                >
                  <SelectTrigger data-testid="edit-team-country">
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
              <div className="grid gap-2">
                <Label htmlFor="sport">Sport</Label>
                <Input
                  id="sport"
                  value={editFormData.sport || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, sport: e.target.value })}
                  placeholder="Enter sport name (e.g., Swimming, Basketball)"
                  data-testid="edit-team-sport"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editFormData.category || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  placeholder="Enter sport category (e.g., Aquatics, Ball Sports)"
                  data-testid="edit-team-category"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="memberCount">Member Count</Label>
                <Input
                  id="memberCount"
                  type="number"
                  min="1"
                  value={editFormData.memberCount || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, memberCount: parseInt(e.target.value) || 0 })}
                  data-testid="edit-team-member-count"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  data-testid="edit-team-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                data-testid="cancel-edit-team"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateTeamMutation.isPending}
                data-testid="save-edit-team"
              >
                {updateTeamMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
