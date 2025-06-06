
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, 
  Database, 
  Bell, 
  Shield, 
  Mail,
  Globe,
  Server,
  Users,
  BookOpen,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminSettings = ({ open, onOpenChange }: AdminSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'SafHub',
    siteDescription: 'Educational platform for Ethiopian students',
    allowRegistration: true,
    emailNotifications: true,
    maintenanceMode: false,
    maxStudentsPerCourse: 100,
    autoApproveTeachers: false,
    backupFrequency: 'daily',
    systemEmail: 'admin@safhub.com'
  });

  const handleSave = () => {
    // In a real app, this would save to database
    toast({
      title: "Settings saved",
      description: "System settings have been updated successfully."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </DialogTitle>
          <DialogDescription>
            Configure and manage system-wide settings for SafHub
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="systemEmail">System Email</Label>
                  <Input
                    id="systemEmail"
                    type="email"
                    value={settings.systemEmail}
                    onChange={(e) => setSettings({...settings, systemEmail: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowRegistration">Allow Public Registration</Label>
                  <Switch
                    id="allowRegistration"
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoApproveTeachers">Auto-approve Teacher Applications</Label>
                  <Switch
                    id="autoApproveTeachers"
                    checked={settings.autoApproveTeachers}
                    onCheckedChange={(checked) => setSettings({...settings, autoApproveTeachers: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxStudents">Max Students per Course</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={settings.maxStudentsPerCourse}
                    onChange={(e) => setSettings({...settings, maxStudentsPerCourse: parseInt(e.target.value)})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                  />
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Export Database
                </Button>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
                <Button variant="destructive" className="w-full">
                  Reset System (Danger)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSettings;
