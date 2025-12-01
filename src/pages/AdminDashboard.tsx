import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Database, Users } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    checkAdminStatus();
    fetchMaintenanceMode();
    fetchLeads();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    const isAdminUser = !!roleData;
    setIsAdmin(isAdminUser);

    if (!isAdminUser) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();

      if (error) throw error;
      setMaintenanceMode(data.value === "true");
    } catch (error) {
      console.error("Error fetching maintenance mode:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("site_settings")
        .update({ 
          value: enabled ? "true" : "false",
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq("key", "maintenance_mode");

      if (error) throw error;

      setMaintenanceMode(enabled);
      toast({
        title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: enabled 
          ? "Site is now showing maintenance page" 
          : "Site is now fully accessible",
      });

      // Refresh after 2 seconds to apply changes
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error updating maintenance mode:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance mode",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAdmin === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Maintenance Mode Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Site Maintenance Mode
            </CardTitle>
            <CardDescription>
              Toggle maintenance mode to show a landing page while making updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={toggleMaintenanceMode}
                disabled={isSaving}
              />
              <Label 
                htmlFor="maintenance-mode" 
                className="text-base cursor-pointer"
              >
                {maintenanceMode ? "Maintenance Mode Active" : "Site Fully Operational"}
              </Label>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              When enabled, visitors will see a maintenance landing page with service info and a contact form.
            </p>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Leads ({leads.length})
            </CardTitle>
            <CardDescription>
              Contact form submissions from the maintenance page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet</p>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="p-4 border border-border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {lead.message && (
                      <p className="text-sm mt-2 p-2 bg-muted/50 rounded">
                        {lead.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Site
          </Button>
          <Button variant="outline" onClick={() => navigate("/my-bookings")}>
            View Bookings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
