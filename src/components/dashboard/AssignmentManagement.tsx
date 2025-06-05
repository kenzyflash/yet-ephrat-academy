
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface AssignmentManagementProps {
  courseId: string;
  courseName: string;
}

const AssignmentManagement = ({ courseId, courseName }: AssignmentManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.due_date || !user) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          course_id: courseId,
          title: newAssignment.title,
          description: newAssignment.description,
          due_date: newAssignment.due_date,
          created_by: user.id
        });

      if (error) throw error;

      await fetchAssignments();
      setNewAssignment({ title: '', description: '', due_date: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Assignment created",
        description: "Your new assignment has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !user) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          title: editingAssignment.title,
          description: editingAssignment.description,
          due_date: editingAssignment.due_date
        })
        .eq('id', editingAssignment.id);

      if (error) throw error;

      await fetchAssignments();
      setEditingAssignment(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Assignment updated",
        description: "Assignment details have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      await fetchAssignments();
      toast({
        title: "Assignment deleted",
        description: "The assignment has been removed.",
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Assignments - {courseName}
            </CardTitle>
            <CardDescription>Manage course assignments and deadlines</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Add a new assignment to your course.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Assignment Title</label>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    placeholder="Enter assignment description and instructions"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAssignment} className="bg-purple-600 hover:bg-purple-700">
                    Create Assignment
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{assignment.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {formatDate(assignment.due_date)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created: {formatDate(assignment.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingAssignment(assignment)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Assignment</DialogTitle>
                    <DialogDescription>
                      Update assignment information.
                    </DialogDescription>
                  </DialogHeader>
                  {editingAssignment && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Assignment Title</label>
                        <Input
                          value={editingAssignment.title}
                          onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={editingAssignment.description}
                          onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="datetime-local"
                          value={editingAssignment.due_date}
                          onChange={(e) => setEditingAssignment({ ...editingAssignment, due_date: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateAssignment} className="bg-purple-600 hover:bg-purple-700">
                          Update Assignment
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteAssignment(assignment.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
            <p>Create your first assignment to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentManagement;
