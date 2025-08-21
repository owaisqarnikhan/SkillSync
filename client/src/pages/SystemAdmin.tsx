import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Crown, 
  Upload,
  Image,
  Database,
  Mail,
  Shield,
  Save
} from "lucide-react";
import type { SystemConfig } from "@shared/types";
import type { UploadResult } from "@uppy/core";

export default function SystemAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [systemConfig, setSystemConfig] = useState<Partial<SystemConfig>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not authorized
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !['superadmin', 'manager'].includes(user?.role || ''))) {
      toast({
        title: "Access Denied",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch system configuration
  const { data: config, isLoading: configLoading } = useQuery<SystemConfig>({
    queryKey: ["/api/system/config/admin"],
    enabled: isAuthenticated && ['superadmin', 'manager'].includes(user?.role || ''),
  });

  useEffect(() => {
    if (config) {
      setSystemConfig(config);
    }
  }, [config]);

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
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logo upload handlers
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

  const handleLogoUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploading(true);
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        // Update logo via dedicated endpoint
        const response = await apiRequest("PUT", "/api/system/logo", {
          logoUrl: uploadURL
        });
        const data = await response.json();
        
        // Update local state with normalized path
        const updatedConfig = { ...systemConfig, logoUrl: data.logoUrl };
        setSystemConfig(updatedConfig);
        
        // Refresh system config
        queryClient.invalidateQueries({ queryKey: ["/api/system/config/admin"] });
        
        toast({
          title: "Logo Uploaded",
          description: "Logo has been uploaded and saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeparatorUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploading(true);
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        // Update separator image via dedicated endpoint
        const response = await apiRequest("PUT", "/api/system/separator", {
          separatorImageUrl: uploadURL
        });
        const data = await response.json();
        
        // Update local state with normalized path
        const updatedConfig = { ...systemConfig, separatorImageUrl: data.separatorImageUrl };
        setSystemConfig(updatedConfig);
        
        // Refresh system config
        queryClient.invalidateQueries({ queryKey: ["/api/system/config/admin"] });
        
        toast({
          title: "Separator Image Uploaded",
          description: "Separator image has been uploaded and saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload separator image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfigUpdate = () => {
    updateConfigMutation.mutate(systemConfig);
  };

  if (isLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading System Administration...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !['superadmin', 'manager'].includes(user?.role || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto mobile-container py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">System Administration</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage system configuration and settings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="login-config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="login-config" data-testid="login-config-tab" className="mobile-tab">
              <Settings className="w-4 h-4 mr-2" />
              System Config
            </TabsTrigger>
            <TabsTrigger value="branding" data-testid="branding-tab" className="mobile-tab">
              <Image className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
          </TabsList>

          {/* System Configuration Tab */}
          <TabsContent value="login-config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>System Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="systemName">System Name</Label>
                      <Input
                        id="systemName"
                        value={systemConfig.systemName || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, systemName: e.target.value }))}
                        placeholder="Asian Youth Games"
                        data-testid="input-system-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="systemSubtitle">System Subtitle</Label>
                      <Input
                        id="systemSubtitle"
                        value={systemConfig.systemSubtitle || ''}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, systemSubtitle: e.target.value }))}
                        placeholder="Bahrain 2025"
                        data-testid="input-system-subtitle"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="maintenanceMode"
                          checked={systemConfig.maintenanceMode || false}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                          data-testid="input-maintenance-mode"
                        />
                        <span className="text-sm text-gray-600">Enable maintenance mode</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Preview</h4>
                    <div className="text-center space-y-2">
                      <h1 className="text-lg font-light text-gray-800">
                        {systemConfig.systemName || 'Asian Youth Games'}
                      </h1>
                      <h2 className="text-lg font-light text-gray-800">
                        {systemConfig.systemSubtitle || 'Bahrain 2025'}
                      </h2>
                      <h3 className="text-lg font-medium text-gray-900">
                        Training Management System
                      </h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Login Logo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="w-5 h-5" />
                    <span>Login & Dashboard Logo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {systemConfig.logoUrl ? (
                      <div className="mb-4">
                        <img
                          src={systemConfig.logoUrl}
                          alt="Login & Dashboard Logo"
                          className="max-h-32 mx-auto object-contain"
                          data-testid="current-logo"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No logo uploaded</p>
                      </div>
                    )}
                    
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={2097152} // 2MB
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleLogoUploadComplete}
                      buttonClassName="w-full"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>{isUploading ? "Uploading..." : "Upload Logo"}</span>
                      </div>
                    </ObjectUploader>
                  </div>
                  
                  {/* Logo Size Configuration */}
                  <div className="space-y-2">
                    <Label htmlFor="logoSize">Logo Size</Label>
                    <Select
                      value={systemConfig.logoSize || 'medium'}
                      onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => setSystemConfig(prev => ({ ...prev, logoSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select logo size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (24px)</SelectItem>
                        <SelectItem value="medium">Medium (32px)</SelectItem>
                        <SelectItem value="large">Large (48px)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (64px)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Logo size will be applied to login page and dashboard headers
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Separator Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="w-5 h-5" />
                    <span>Login Page Separator</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {systemConfig.separatorImageUrl ? (
                      <div className="mb-4">
                        <img
                          src={systemConfig.separatorImageUrl}
                          alt="Separator Image"
                          className="max-h-32 mx-auto object-contain"
                          data-testid="current-separator"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No separator image uploaded</p>
                      </div>
                    )}
                    
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={2097152} // 2MB
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleSeparatorUploadComplete}
                      buttonClassName="w-full"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>{isUploading ? "Uploading..." : "Upload Separator"}</span>
                      </div>
                    </ObjectUploader>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-6 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Make sure to save your changes
            </div>
            <Button 
              onClick={handleConfigUpdate}
              disabled={updateConfigMutation.isPending}
              size="lg"
              data-testid="button-save-config"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateConfigMutation.isPending ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}