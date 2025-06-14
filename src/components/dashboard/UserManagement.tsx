import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, Search, Edit, RefreshCw, AlertTriangle } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users with proper JOIN query...');
      
      // Now we can use JOIN since the foreign key relationship exists
      const { data: joinedData, error: joinError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `);
      
      if (joinError) {
        console.error('❌ JOIN query failed:', joinError);
        throw joinError;
      }
      
      console.log('🔗 Joined data:', joinedData);
      
      if (!joinedData || joinedData.length === 0) {
        console.warn('⚠️ No profiles found in database');
        setUsers([]);
        setDebugInfo({ 
          profileCount: 0, 
          rolesCount: 0, 
          error: 'No profiles found',
          strategy: 'join_query'
        });
        toast({
          title: "No Users Found",
          description: "No user profiles were found in the database.",
          variant: "destructive"
        });
        return;
      }

      // Process the joined data
      const processedUsers: User[] = joinedData.map(profile => {
        const userRole = profile.user_roles?.[0]?.role || 'student';
        
        console.log(`👤 Processing: ${profile.email}`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Name: ${profile.first_name} ${profile.last_name}`);
        console.log(`   - Role: ${userRole}`);
        console.log(`   - School: ${profile.school || 'None'}`);
        console.log(`   - Grade: ${profile.grade || 'None'}`);
        
        return {
          id: profile.id,
          first_name: profile.first_name || 'Unknown',
          last_name: profile.last_name || 'User',
          email: profile.email || 'No email',
          role: userRole as 'student' | 'teacher' | 'admin',
          created_at: profile.created_at,
          school: profile.school || undefined,
          grade: profile.grade || undefined
        };
      });

      console.log('✅ Final processed users:', processedUsers);
      console.log(`📊 Total users processed: ${processedUsers.length}`);

      // Update state
      setUsers(processedUsers);
      setDebugInfo({
        profileCount: joinedData.length,
        rolesCount: joinedData.filter(p => p.user_roles && p.user_roles.length > 0).length,
        processedCount: processedUsers.length,
        strategy: 'join_query_with_fk',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Users Loaded Successfully",
        description: `Successfully loaded ${processedUsers.length} users using JOIN query.`,
      });
      
    } catch (error) {
      console.error('💥 Critical error in fetchAllUsers:', error);
      setDebugInfo({
        error: error.message,
        strategy: 'failed_join_query',
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Error Loading Users",
        description: `Failed to load users: ${error.message}`,
        variant: "destructive"
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Keep the alternative fetch as backup
  const alternativeFetch = async () => {
    try {
      console.log('🔄 Trying alternative fetch method with direct queries...');
      
      // Fetch all profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('❌ Profiles query failed:', profilesError);
        throw profilesError;
      }
      
      console.log('📊 Profiles fetched:', profilesData?.length || 0);
      
      // Fetch all roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error('❌ Roles query failed:', rolesError);
        // Don't throw error, just use default roles
      }
      
      console.log('🎭 Roles fetched:', rolesData?.length || 0);
      
      // Create a map of user roles
      const userRoleMap = new Map<string, string>();
      rolesData?.forEach(roleEntry => {
        userRoleMap.set(roleEntry.user_id, roleEntry.role);
      });
      
      // Combine the data
      const processedUsers = profilesData?.map(profile => ({
        id: profile.id,
        first_name: profile.first_name || 'Unknown',
        last_name: profile.last_name || 'User',
        email: profile.email || 'No email',
        role: (userRoleMap.get(profile.id) || 'student') as 'student' | 'teacher' | 'admin',
        created_at: profile.created_at,
        school: profile.school,
        grade: profile.grade
      })) || [];
      
      setUsers(processedUsers);
      setDebugInfo({
        profileCount: profilesData?.length || 0,
        rolesCount: rolesData?.length || 0,
        processedCount: processedUsers.length,
        strategy: 'direct_queries_backup',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Alternative fetch successful:', processedUsers);
      
      toast({
        title: "Alternative Fetch Successful",
        description: `Loaded ${processedUsers.length} users using direct queries method.`,
      });
    } catch (error) {
      console.error('❌ Alternative fetch failed:', error);
      toast({
        title: "Alternative Fetch Failed",
        description: `Failed to load users with alternative method: ${error.message}`,
        variant: "destructive"
      });
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
      
      // Delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error deleting existing role:', deleteError);
      }

      // Insert new role
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
            <p>Loading all users from database...</p>
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
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={alternativeFetch}
                className="text-orange-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Try Alternative Method
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllUsers}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All Users
              </Button>
            </div>
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
          </div>

          {/* Enhanced Debug Status */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Database Status:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Profiles Found:</strong> {debugInfo.profileCount || 0}</p>
                <p><strong>Roles Found:</strong> {debugInfo.rolesCount || 0}</p>
                <p><strong>Processed Users:</strong> {debugInfo.processedCount || 0}</p>
              </div>
              <div>
                <p><strong>Current Display:</strong> {filteredUsers.length} users</p>
                <p><strong>Search Term:</strong> "{searchTerm || 'none'}"</p>
                <p><strong>Role Filter:</strong> {roleFilter}</p>
                <p><strong>Strategy:</strong> {debugInfo.strategy || 'unknown'}</p>
              </div>
            </div>
            {debugInfo.error && (
              <p className="text-red-600 mt-2"><strong>Error:</strong> {debugInfo.error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Last updated: {debugInfo.timestamp}</p>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">No users found</p>
              <p className="text-xs">
                {users.length === 0 
                  ? "No users found in database. Try the 'Alternative Method' button above." 
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
