import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, Search, Edit, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  school?: string;
  grade?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users with admin access...');
      
      // Only admins can access user management
      if (userRole !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view user management.",
          variant: "destructive"
        });
        return;
      }

      // Use the new security definer function to get all users with roles
      const { data: usersWithRoles, error } = await supabase
        .rpc('get_all_users_with_roles');

      if (error) {
        console.error('Error fetching users via RPC:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log('Users fetched via RPC:', usersWithRoles?.length, usersWithRoles);

      // Transform the data to match our User interface
      const transformedUsers: User[] = usersWithRoles?.map(user => ({
        id: user.id,
        first_name: user.first_name || 'Unknown',
        last_name: user.last_name || 'User',
        email: user.email,
        role: user.role as 'student' | 'teacher' | 'admin',
        created_at: user.created_at,
        school: user.school || undefined,
        grade: user.grade || undefined
      })) || [];

      console.log('Transformed users:', transformedUsers);
      setUsers(transformedUsers);
      
      toast({
        title: "Users Loaded",
        description: `Successfully loaded ${transformedUsers.length} users.`,
      });
      
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to load users. Please try again.";
      if (error.message?.includes('Access denied')) {
        errorMessage = "Access denied. You may not have the required admin permissions.";
      } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        errorMessage = "Access denied. Please ensure you have admin privileges.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      console.log(`Updating role for user ${userId} to ${newRole}`);
      
      // Validate admin permissions
      if (userRole !== 'admin') {
        throw new Error('Only administrators can update user roles');
      }

      // Validate input
      if (!userId || !newRole) {
        throw new Error('Invalid user ID or role');
      }

      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing role:', checkError);
        throw new Error(`Failed to check existing role: ${checkError.message}`);
      }

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error(`Failed to update role: ${updateError.message}`);
        }
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Failed to assign role: ${insertError.message}`);
        }
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });
      
    } catch (error: any) {
      console.error('Error updating role:', error);
      
      let errorMessage = "Failed to update user role. Please try again.";
      if (error.message?.includes('permission denied')) {
        errorMessage = "Permission denied. You may not have admin rights.";
      } else if (error.message?.includes('RLS')) {
        errorMessage = "Access restricted by security policy.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const updateUserProfile = async () => {
    if (!editingUser) return;

    try {
      // Validate admin permissions
      if (userRole !== 'admin') {
        throw new Error('Only administrators can update user profiles');
      }

      // Validate required fields
      if (!editingUser.first_name?.trim() || !editingUser.last_name?.trim() || !editingUser.email?.trim()) {
        throw new Error('First name, last name, and email are required');
      }

      // Validate email format
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(editingUser.email)) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editingUser.first_name.trim(),
          last_name: editingUser.last_name.trim(),
          email: editingUser.email.trim(),
          school: editingUser.school?.trim() || null,
          grade: editingUser.grade?.trim() || null
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      
      setEditingUser(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Profile Updated",
        description: "User profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = error.message || "Failed to update user profile. Please try again.";
      if (error.message?.includes('permission denied')) {
        errorMessage = "Permission denied. You may not have admin rights.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStats = () => {
    const total = users.length;
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, byRole };
  };

  const stats = getUserStats();

  // Check if user has admin access
  if (userRole !== 'admin') {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access user management.</p>
            <p className="text-sm text-gray-500 mt-2">This section is restricted to administrators only.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Enhanced Security Active</p>
              <p className="text-xs text-blue-700">Row-level security policies are now enforced. All actions are logged for audit purposes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{stats.byRole.admin || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Teachers</p>
              <p className="text-2xl font-bold">{stats.byRole.teacher || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-2xl font-bold">{stats.byRole.student || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage all user accounts and permissions - Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">No users found</p>
              <p className="text-xs">
                {users.length === 0 
                  ? "No users found in database." 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.school || '-'}</TableCell>
                    <TableCell>{user.grade || '-'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Update user information. All fields marked with * are required.
                              </DialogDescription>
                            </DialogHeader>
                            {editingUser && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">First Name *</label>
                                  <Input
                                    value={editingUser.first_name}
                                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                    placeholder="Enter first name"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Last Name *</label>
                                  <Input
                                    value={editingUser.last_name}
                                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                    placeholder="Enter last name"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email *</label>
                                  <Input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    placeholder="Enter email address"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">School</label>
                                  <Input
                                    value={editingUser.school || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, school: e.target.value })}
                                    placeholder="Enter school name"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Grade</label>
                                  <Input
                                    value={editingUser.grade || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, grade: e.target.value })}
                                    placeholder="Enter grade level"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={updateUserProfile} className="bg-emerald-600 hover:bg-emerald-700">
                                    Update User
                                  </Button>
                                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
