
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  students: number;
  nextClass: string;
  status: 'Active' | 'Draft' | 'Completed';
  completionRate: number;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Ethiopian History and Culture",
      description: "Comprehensive course covering Ethiopian history from ancient times to modern day.",
      students: 1234,
      nextClass: "Today, 2:00 PM",
      status: "Active",
      completionRate: 78
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      description: "Advanced mathematical concepts including calculus and algebra.",
      students: 856,
      nextClass: "Tomorrow, 10:00 AM",
      status: "Active",
      completionRate: 65
    }
  ]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    nextClass: ''
  });

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const course: Course = {
      id: Date.now(),
      title: newCourse.title,
      description: newCourse.description,
      students: 0,
      nextClass: newCourse.nextClass || "Not scheduled",
      status: "Draft",
      completionRate: 0
    };

    setCourses([...courses, course]);
    setNewCourse({ title: '', description: '', nextClass: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Course created",
      description: "Your new course has been created successfully.",
    });
  };

  const handleEditCourse = () => {
    if (!editingCourse) return;

    setCourses(courses.map(course => 
      course.id === editingCourse.id ? editingCourse : course
    ));
    setEditingCourse(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Course updated",
      description: "Course details have been updated successfully.",
    });
  };

  const handleDeleteCourse = (courseId: number) => {
    setCourses(courses.filter(course => course.id !== courseId));
    toast({
      title: "Course deleted",
      description: "The course has been removed.",
    });
  };

  const toggleCourseStatus = (courseId: number) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, status: course.status === 'Active' ? 'Draft' : 'Active' as Course['status'] }
        : course
    ));
  };

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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your teaching portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Course Title</label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Enter course description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Next Class (Optional)</label>
                  <Input
                    value={newCourse.nextClass}
                    onChange={(e) => setNewCourse({ ...newCourse, nextClass: e.target.value })}
                    placeholder="e.g., Monday, 10:00 AM"
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
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.students.toLocaleString()} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {course.nextClass}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={course.status === 'Active' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => toggleCourseStatus(course.id)}
                >
                  {course.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Completion Rate:</span> {course.completionRate}%
              </div>
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  <DialogContent>
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
                        <div>
                          <label className="text-sm font-medium">Next Class</label>
                          <Input
                            value={editingCourse.nextClass}
                            onChange={(e) => setEditingCourse({ ...editingCourse, nextClass: e.target.value })}
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
      </CardContent>
    </Card>
  );
};

export default CourseManagement;
