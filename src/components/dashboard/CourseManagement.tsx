
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, Calendar, BookOpen, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourseData } from '@/hooks/useCourseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ThumbnailUploader from '@/components/enhanced/ThumbnailUploader';

interface NewCourseData {
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  price: string;
  image_url: string;
}

interface CourseManagementProps {
  onCourseSelect?: (courseId: string) => void;
}

const CourseManagement = ({ onCourseSelect }: CourseManagementProps) => {
  const { user } = useAuth();
  const { courses, loading, refetchCourses } = useCourseData();
  const { toast } = useToast();

  const [newCourse, setNewCourse] = useState<NewCourseData>({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    category: 'Mathematics',
    price: 'Free',
    image_url: ''
  });

  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Filter courses to show only those created by the current user
  const userCourses = courses.filter(course => course.instructor_id === user?.id);

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description || !user) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: newCourse.title,
          description: newCourse.description,
          instructor_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Teacher',
          instructor_id: user.id,
          duration: newCourse.duration,
          level: newCourse.level,
          category: newCourse.category,
          price: newCourse.price,
          image_url: newCourse.image_url,
          student_count: 0,
          rating: 0,
          total_lessons: 0
        });

      if (error) throw error;

      await refetchCourses();
      setNewCourse({
        title: '',
        description: '',
        duration: '',
        level: 'Beginner',
        category: 'Mathematics',
        price: 'Free',
        image_url: ''
      });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Course created",
        description: "Your new course has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: `Failed to create course: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !user) return;

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: editingCourse.title,
          description: editingCourse.description,
          duration: editingCourse.duration,
          level: editingCourse.level,
          category: editingCourse.category,
          price: editingCourse.price,
          image_url: editingCourse.image_url
        })
        .eq('id', editingCourse.id);

      if (error) throw error;

      await refetchCourses();
      setEditingCourse(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Course updated",
        description: "Course details have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: `Failed to update course: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      await refetchCourses();
      toast({
        title: "Course deleted",
        description: "The course has been removed.",
      });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: `Failed to delete course: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (onCourseSelect) {
      onCourseSelect(courseId);
    }
  };

  // Only show loading on initial load when we have no courses data yet
  if (loading && courses.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">Loading courses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Course Management
            </CardTitle>
            <CardDescription>Create and manage your courses</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your teaching portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Course Title *</label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Enter course description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="e.g., 4 weeks"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                      placeholder="e.g., Free, $99"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Level</label>
                    <select
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Art">Art</option>
                      <option value="Music">Music</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Course Thumbnail</label>
                  <ThumbnailUploader
                    onUploadComplete={(url) => setNewCourse({ ...newCourse, image_url: url })}
                    currentUrl={newCourse.image_url}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateCourse} className="bg-emerald-600 hover:bg-emerald-700">
                    Create Course
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
        {userCourses.map((course) => (
          <div 
            key={course.id} 
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
              selectedCourseId === course.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
            }`}
            onClick={() => handleCourseSelect(course.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-4 flex-1">
                {course.image_url && (
                  <img 
                    src={course.image_url} 
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {(course.student_count || 0).toLocaleString()} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {course.duration || 'Duration TBD'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  {course.level || 'Beginner'}
                </Badge>
                <Badge variant="outline">
                  {course.category || 'General'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Rating:</span> {course.rating || 0}/5 | 
                <span className="font-medium"> Price:</span> {course.price || 'Free'}
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {onCourseSelect && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCourseSelect(course.id)}
                    className={selectedCourseId === course.id ? 'bg-emerald-100' : ''}
                  >
                    <Settings className="mr-1 h-4 w-4" />
                    {selectedCourseId === course.id ? 'Selected' : 'Select'}
                  </Button>
                )}
                <Dialog open={isEditDialogOpen && editingCourse?.id === course.id} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCourse(course)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Course</DialogTitle>
                      <DialogDescription>
                        Update course information.
                      </DialogDescription>
                    </DialogHeader>
                    {editingCourse && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Course Title</label>
                          <Input
                            value={editingCourse.title}
                            onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={editingCourse.description}
                            onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Duration</label>
                            <Input
                              value={editingCourse.duration}
                              onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Price</label>
                            <Input
                              value={editingCourse.price}
                              onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Level</label>
                            <select
                              value={editingCourse.level}
                              onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="All Levels">All Levels</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Category</label>
                            <select
                              value={editingCourse.category}
                              onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="Mathematics">Mathematics</option>
                              <option value="Science">Science</option>
                              <option value="English">English</option>
                              <option value="History">History</option>
                              <option value="Geography">Geography</option>
                              <option value="Computer Science">Computer Science</option>
                              <option value="Art">Art</option>
                              <option value="Music">Music</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Course Thumbnail</label>
                          <ThumbnailUploader
                            onUploadComplete={(url) => setEditingCourse({ ...editingCourse, image_url: url })}
                            currentUrl={editingCourse.image_url}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleEditCourse} className="bg-emerald-600 hover:bg-emerald-700">
                            Update Course
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
                  onClick={() => handleDeleteCourse(course.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {userCourses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p>Create your first course to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseManagement;
