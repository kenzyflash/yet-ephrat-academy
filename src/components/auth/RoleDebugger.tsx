
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const RoleDebugger = () => {
  const [loading, setLoading] = useState(false);
  const { user, userRole, refreshUser } = useAuth();
  const { toast } = useToast();

  const assignAdminRole = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // First, delete any existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Then insert admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user.id, 
          role: 'admin' as const
        });

      if (error) {
        console.error('Error assigning admin role:', error);
        toast({
          title: "Error",
          description: "Failed to assign admin role: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Admin role assigned successfully!",
      });

      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkRole = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('Role check result:', { data, error });
      
      toast({
        title: "Role Check",
        description: `Current roles: ${data?.length ? data.map(r => r.role).join(', ') : 'None'}`,
      });
    } catch (error) {
      console.error('Error checking role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Role Debugger</CardTitle>
        <CardDescription>
          Debug and manage user roles (Admin use only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>User:</strong> {user.email}</p>
          <p><strong>Current Role:</strong> {userRole || 'None'}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={checkRole} disabled={loading} variant="outline">
            Check Current Role
          </Button>
          <Button onClick={assignAdminRole} disabled={loading}>
            Assign Admin Role
          </Button>
          <Button onClick={refreshUser} disabled={loading} variant="secondary">
            Refresh User Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleDebugger;
