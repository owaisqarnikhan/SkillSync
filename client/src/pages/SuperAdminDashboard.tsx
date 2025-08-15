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
  Settings,
  Users,
  Shield,
  BarChart3,
  FileText,
  Crown,
  Database,
  Mail
} from "lucide-react";
import type { SystemConfig, DashboardPermission, User } from "@shared/schema";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [systemConfig, setSystemConfig] = useState<Partial<SystemConfig>>({});

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

  useEffect(() => {
    if (config) {
      setSystemConfig(config);
    }
  }, [config]);

  const handleConfigUpdate = () => {
    updateConfigMutation.mutate(systemConfig);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">--</p>
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
                  <p className="text-2xl font-bold">{(stats as any)?.availableVenues || 0}</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system-config" data-testid="system-config-tab">
              <Settings className="w-4 h-4 mr-2" />
              System Config
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="permissions-tab">
              <Shield className="w-4 h-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="audit-tab">
              <FileText className="w-4 h-4 mr-2" />
              Audit Logs
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

          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">User Management</p>
                  <p className="text-muted-foreground">
                    User management functionality will be implemented here.
                  </p>
                </div>
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
        </Tabs>
      </div>
    </div>
  );
}