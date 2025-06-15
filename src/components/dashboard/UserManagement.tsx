import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, UserCheck, Search, Edit, Shield, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
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

interface RoleUpdateResponse {
  success: boolean;
  error?: string;
  message?: string;
  old_role?: string;
  new_role?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{userId: string, newRole: string, userName: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole, user: currentUser, refreshUserRole } = useAuth();
  
  // Refs to prevent multiple concurrent operations
  const roleUpdateInProgress = useRef(false);
  const componentMounted = useRef(true);
  const realtimeCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    componentMounted.current = true;
    if (userRole === 'admin') {
      initializeUserManagement();
    }
    
    return () => {
      componentMounted.current = false;
      if (realtimeCleanup.current) {
        realtimeCleanup.current();
      }
    };
  }, [userRole]);

  const initializeUserManagement = async () => {
    try {
      await fetchUsers();
      setupRealtimeSubscriptions();
    } catch (error) {
      console.error('Error initializing user management:', error);
    }
  };

  const setupRealtimeSubscriptions = useCallback(() => {
    if (userRole !== 'admin') return;

    // Clean up existing subscription
    if (realtimeCleanup.current) {
      realtimeCleanup.current();
    }

    console.log('Setting up user management realtime subscriptions...');

    // Listen for role changes in real-time
    const roleChangesChannel = supabase
      .channel(`user-mgmt-role-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('Role change detected in user management:', payload);
          
          // Debounce the refresh to avoid rapid successive calls
          if (componentMounted.current) {
            setTimeout(() => {
              if (componentMounted.current) {
                fetchUsers();
              }
            }, 1000);
          }
          
          // If the current user's role changed, refresh their session
          if ((payload.new && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id === currentUser?.id) || 
              (payload.old && typeof payload.old === 'object' && 'user_id' in payload.old && payload.old.user_id === currentUser?.id)) {
            refreshUserRole();
          }
        }
      )
      .subscribe();

    // Store cleanup function
    realtimeCleanup.current = () => {
      console.log('Cleaning up user management subscriptions...');
      supabase.removeChannel(roleChangesChannel);
    };
  }, [userRole, currentUser?.id, refreshUserRole]);

  const fetchUsers = useCallback(async () => {
    if (roleUpdateInProgress.current) {
      console.log('Role update in progress, skipping user fetch...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching users with admin access...');
      
      if (userRole !== 'admin') {
        throw new Error('Access denied. Admin role required.');
      }

      const { data: usersWithRoles, error } = await supabase
        .rpc('get_all_users_with_roles');

      if (error) {
        console.error('Error fetching users via RPC:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      if (!componentMounted.current) return;

      console.log('Users fetched via RPC:', usersWithRoles?.length, usersWithRoles);

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
      
      if (!componentMounted.current) return;
      
      let errorMessage = "Failed to load users. Please try again.";
      if (error.message?.includes('Access denied')) {
        errorMessage = "Access denied. You may not have the required admin permissions.";
      } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        errorMessage = "Access denied. Please ensure you have admin privileges.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  }, [userRole, toast]);

  const handleRoleChangeConfirm = async () => {
    if (!pendingRoleChange || roleUpdateInProgress.current) {
      console.log('Role update already in progress or no pending change');
      return;
    }

    const { userId, newRole } = pendingRoleChange;
    
    try {
      roleUpdateInProgress.current = true;
      setUpdating(userId);
      console.log(`Updating role for user ${userId} to ${newRole}`);
      
      if (userRole !== 'admin') {
        throw new Error('Only administrators can update user roles');
      }

      // Use the secure function
      const { data, error } = await supabase
        .rpc('update_user_role', {
          target_user_id: userId,
          new_role: newRole
        });

      if (error) {
        console.error('Role update error:', error);
        throw new Error(`Failed to update role: ${error.message}`);
      }

      // Type guard and safe type conversion
      const response = data as unknown as RoleUpdateResponse;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update role');
      }

      if (!componentMounted.current) return;

      // Update local state immediately for better UX
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ));
      
      toast({
        title: "Role Updated",
        description: response.message || `User role has been updated to ${newRole}.`,
      });
      
      // Refresh the user list after a delay to ensure consistency
      setTimeout(() => {
        if (componentMounted.current) {
          fetchUsers();
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Error updating role:', error);
      
      if (!componentMounted.current) return;
      
      let errorMessage = "Failed to update user role. Please try again.";
      if (error.message?.includes('permission denied')) {
        errorMessage = "Permission denied. You may not have admin rights.";
      } else if (error.message?.includes('Cannot remove your own admin privileges')) {
        errorMessage = "You cannot remove your own admin privileges.";
      } else if (error.message?.includes('Access denied')) {
        errorMessage = "Access denied. Admin role required.";
      } else if (error.message?.includes('already in progress')) {
        errorMessage = "Role update already in progress. Please wait.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      roleUpdateInProgress.current = false;
      setUpdating(null);
      setPendingRoleChange(null);
    }
  };

  const initiateRoleChange = useCallback((userId: string, newRole: string) => {
    if (roleUpdateInProgress.current) {
      toast({
        title: "Please wait",
        description: "Another role update is in progress.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Don't allow changes if already the same role
    if (user.role === newRole) {
      toast({
        title: "No change needed",
        description: "User already has this role.",
      });
      return;
    }

    // Check if it's a critical change that needs confirmation
    const isCriticalChange = (user.role === 'admin' && newRole !== 'admin') || 
                           (newRole === 'admin' && user.role !== 'admin');

    if (isCriticalChange) {
      setPendingRoleChange({
        userId,
        newRole,
        userName: `${user.first_name} ${user.last_name}`
      });
    } else {
      // For non-critical changes, proceed directly with confirmation
      setPendingRoleChange({ userId, newRole, userName: `${user.first_name} ${user.last_name}` });
      setTimeout(() => handleRoleChangeConfirm(), 0);
    }
  }, [users, toast]);

  const updateUserProfile = async () => {
    if (!editingUser) return;

    try {
      if (userRole !== 'admin') {
        throw new Error('Only administrators can update user profiles');
      }

      if (!editingUser.first_name?.trim() || !editingUser.last_name?.trim() || !editingUser.email?.trim()) {
        throw new Error('First name, last name, and email are required');
      }

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
      {/* Enhanced Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Enhanced Security Active</p>
              <p className="text-xs text-blue-700">Real-time role synchronization enabled. All actions are logged and validated server-side.</p>
            </div>
            {error && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setError(null);
                  fetchUsers();
                }}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error Loading Data</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setError(null);
                  fetchUsers();
                }}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Button 
              onClick={fetchUsers} 
              variant="outline" 
              disabled={loading || roleUpdateInProgress.current}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
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
                          onValueChange={(value) => initiateRoleChange(user.id, value)}
                          disabled={updating === user.id || roleUpdateInProgress.current}
                        >
                          <SelectTrigger className="w-32">
                            {updating === user.id ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs">Updating...</span>
                              </div>
                            ) : (
                              <SelectValue />
                            )}
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
                              disabled={updating === user.id || roleUpdateInProgress.current}
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

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!pendingRoleChange} onOpenChange={() => setPendingRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRoleChange && (
                <>
                  Are you sure you want to change <strong>{pendingRoleChange.userName}</strong>'s role to <strong>{pendingRoleChange.newRole}</strong>?
                  {(pendingRoleChange.newRole === 'admin' || pendingRoleChange.userId === currentUser?.id) && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-800 text-sm">
                      <strong>Warning:</strong> This is a critical role change that will affect system access permissions.
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={roleUpdateInProgress.current}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRoleChangeConfirm} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={roleUpdateInProgress.current}
            >
              {roleUpdateInProgress.current ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                'Confirm Change'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
