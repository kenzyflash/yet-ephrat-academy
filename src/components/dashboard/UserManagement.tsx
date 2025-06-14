import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, Search, Edit, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting to fetch all users and roles...');
      
      // Get ALL profiles from the database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Profiles query result:', { profiles, error: profilesError });

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.warn('⚠️ No profiles found in database');
        setUsers([]);
        return;
      }

      console.log(`✅ Found ${profiles.length} profiles:`, profiles);

      // Get ALL user roles from the database
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      console.log('🎭 User roles query result:', { userRoles, error: rolesError });

      if (rolesError) {
        console.error('❌ Error fetching user roles:', rolesError);
        // Don't throw here, continue with empty roles
      }

      console.log(`✅ Found ${userRoles?.length || 0} user roles:`, userRoles);

      // Create a map for quick role lookup
      const roleMap = new Map<string, string>();
      if (userRoles && userRoles.length > 0) {
        userRoles.forEach(roleEntry => {
          roleMap.set(roleEntry.user_id, roleEntry.role);
          console.log(`👤 User ${roleEntry.user_id} has role: ${roleEntry.role}`);
        });
      }

      console.log('🗺️ Role map created with entries:', roleMap.size);

      // Combine profiles with their roles
      const usersWithRoles: User[] = profiles.map(profile => {
        const userRole = roleMap.get(profile.id) || 'student';
        console.log(`🔗 Mapping user ${profile.email} (${profile.id}) with role: ${userRole}`);
        
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          role: userRole as 'student' | 'teacher' | 'admin',
          created_at: profile.created_at,
          school: profile.school || undefined,
          grade: profile.grade || undefined
        };
      });

      console.log(`🎯 Final users array with ${usersWithRoles.length} users:`, usersWithRoles);

      // Create default roles for users who don't have any
      const usersWithoutRoles = usersWithRoles.filter(user => !roleMap.has(user.id));
      
      if (usersWithoutRoles.length > 0) {
        console.log(`🆕 Creating default roles for ${usersWithoutRoles.length} users:`, 
          usersWithoutRoles.map(u => u.email));
        
        const defaultRoleInserts = usersWithoutRoles.map(user => ({
          user_id: user.id,
          role: 'student' as const
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(defaultRoleInserts);

        if (insertError) {
          console.warn('⚠️ Could not insert default roles:', insertError);
        } else {
          console.log('✅ Successfully created default student roles');
        }
      }

      setUsers(usersWithRoles);
      console.log(`🎉 Successfully loaded ${usersWithRoles.length} users into state`);
      
    } catch (error) {
      console.error('💥 Critical error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please check the console for details.",
        variant: "destructive"
      });
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUpdateUserRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      setUpdatingRole(userId);
      console.log(`🔄 Updating user ${userId} role to ${newRole}`);
      
      // First, delete any existing role for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error deleting existing role:', deleteError);
      }

      // Then insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: newRole 
        });

      if (insertError) {
        console.error('❌ Error inserting new role:', insertError);
        throw insertError;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      console.log(`✅ Successfully updated user ${userId} role to ${newRole}`);
      toast({
        title: "Success",
        description: `User role has been updated to ${newRole}.`,
      });
    } catch (error) {
      console.error('💥 Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          email: editingUser.email,
          school: editingUser.school,
          grade: editingUser.grade
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setEditingUser(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "User details have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user details. Please try again.",
        variant: "destructive"
      });
    }
  };

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
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
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
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Teachers</p>
              <p className="text-2xl font-bold">{stats.byRole.teacher || 0}</p>
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
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="ml-auto"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Manage user accounts and permissions ({filteredUsers.length} of {users.length} users shown)
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
          </div>

          {/* Debug Info - Enhanced */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-blue-800 mb-2">Database Status:</p>
                <p>📊 Total users loaded: <span className="font-medium">{users.length}</span></p>
                <p>🔍 Filtered users shown: <span className="font-medium">{filteredUsers.length}</span></p>
                <p>🎭 Current role filter: <span className="font-medium">"{roleFilter}"</span></p>
                <p>🔎 Search term: <span className="font-medium">"{searchTerm}"</span></p>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-2">Role Distribution:</p>
                <p>👑 Admins: <span className="font-medium">{stats.byRole.admin || 0}</span></p>
                <p>🎓 Teachers: <span className="font-medium">{stats.byRole.teacher || 0}</span></p>
                <p>📚 Students: <span className="font-medium">{stats.byRole.student || 0}</span></p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Check your browser console for detailed logs if users are missing.
                Try clicking the "Refresh" button to reload all users from the database.
              </p>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium mb-1">No users found</p>
                <p className="text-xs">
                  {users.length === 0 
                    ? "No users in database. Check console logs for errors." 
                    : "Try adjusting your search or filter criteria, or click Refresh to reload users."
                  }
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        {user.school && <span>School: {user.school}</span>}
                        {user.grade && <span>Grade: {user.grade}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateUserRole(user.id, value as any)}
                        disabled={updatingRole === user.id}
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
                              Update user information.
                            </DialogDescription>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">First Name</label>
                                <Input
                                  value={editingUser.first_name}
                                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Last Name</label>
                                <Input
                                  value={editingUser.last_name}
                                  onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">School</label>
                                <Input
                                  value={editingUser.school || ''}
                                  onChange={(e) => setEditingUser({ ...editingUser, school: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Grade</label>
                                <Input
                                  value={editingUser.grade || ''}
                                  onChange={(e) => setEditingUser({ ...editingUser, grade: e.target.value })}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleEditUser} className="bg-emerald-600 hover:bg-emerald-700">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
