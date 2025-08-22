import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SystemConfig } from "@shared/types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Fetch system configuration for logo and branding
  const { data: systemConfig } = useQuery({
    queryKey: ["/api/system/config"],
    queryFn: () => apiRequest("GET", "/api/system/config"),
  });

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => apiRequest("POST", "/api/login", data),
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to the Training Management System!",
      });
      // Redirect to root path, which will handle role-based routing
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              {systemConfig?.logoUrl ? (
                <img
                  src={systemConfig.logoUrl}
                  alt="Logo"
                  className={`object-contain ${
                    systemConfig.logoSize === 'small' ? 'h-8 w-8' :
                    systemConfig.logoSize === 'medium' ? 'h-12 w-12' :
                    systemConfig.logoSize === 'large' ? 'h-16 w-16' :
                    systemConfig.logoSize === 'xlarge' ? 'h-20 w-20' :
                    'h-12 w-12'
                  }`}
                />
              ) : (
                <Shield className="h-12 w-12 text-blue-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {systemConfig?.systemName || "Asian Youth Games"}
            </h1>
            {systemConfig?.systemSubtitle && (
              <h1 className="text-3xl font-bold text-gray-900">{systemConfig.systemSubtitle}</h1>
            )}
            {!systemConfig?.systemName && (
              <h1 className="text-3xl font-bold text-gray-900">Bahrain 2025</h1>
            )}
            <p className="mt-2 text-gray-600">
              Sign in to access the Training Management System
            </p>
          </div>

          {/* Login Card */}
          <Card className="bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">
                Sign In
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your username"
                            className="h-11"
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="h-11 pr-10"
                              disabled={loginMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={loginMutation.isPending}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <b>Need an account? </b>Contact to IT team of Bahrain Asian
                  Youth Games for access credentials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Separator Image */}
      <div className="hidden lg:flex lg:flex-1">
        <div
          className="w-full bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('/assets/asian-youth-games-bg.png')",
          }}
        >
          <div className="absolute inset-0 bg-blue-900/10"></div>
        </div>
      </div>
    </div>
  );
}
