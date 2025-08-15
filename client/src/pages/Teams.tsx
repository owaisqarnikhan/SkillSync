import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users,
  MapPin,
  Trophy,
  User,
  Flag,
  Search
} from "lucide-react";
import type { TeamWithDetails, Country, Sport } from "@shared/schema";

export default function Teams() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: sports = [] } = useQuery<Sport[]>({
    queryKey: ["/api/sports"],
    enabled: isAuthenticated,
  });

  // Filter teams based on country, sport, and search term
  const filteredTeams = teams.filter(team => {
    const countryMatch = countryFilter === "all" || team.country.code === countryFilter;
    const sportMatch = sportFilter === "all" || team.sport.id === sportFilter;
    const searchMatch = searchTerm === "" || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.sport.name.toLowerCase().includes(searchTerm.toLowerCase());
    return countryMatch && sportMatch && searchMatch;
  });

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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-gray-600 mt-1">
            Browse participating teams from across Asia
            {user?.role === 'customer' && user.countryCode && ` - Showing teams from ${user.countryCode}`}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search teams, countries, or sports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="search-teams-input"
                />
              </div>
              <div>
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
              <div>
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger data-testid="sport-filter-select">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow" data-testid={`team-card-${team.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {team.country.flagUrl ? (
                        <img 
                          src={team.country.flagUrl} 
                          alt={`${team.country.name} flag`}
                          className="w-8 h-6 object-cover rounded"
                        />
                      ) : (
                        <Flag className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`team-name-${team.id}`}>
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {team.country.name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {team.sport.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Team stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {team.memberCount} members
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {team.sport.category || 'Sports'}
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
                        <Button variant="outline" size="sm" data-testid={`view-team-${team.id}`}>
                          View Details
                        </Button>
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
                    {new Set(filteredTeams.map(t => t.sport.id)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Sports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
