
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Video, FileText, Settings } from 'lucide-react';
import CourseManagement from './CourseManagement';
import LessonManagement from './LessonManagement';
import AssignmentManagement from './AssignmentManagement';
import { useCourseData } from '@/hooks/useCourseData';
import { useAuth } from '@/contexts/AuthContext';

const EnhancedCourseManagement = () => {
  const { user } = useAuth();
  const { courses, loading } = useCourseData();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('courses');

  // Filter courses to show only those created by the current user
  const userCourses = courses.filter(course => course.instructor_id === user?.id);
  const selectedCourse = userCourses.find(course => course.id === selectedCourseId);

  // Auto-switch to courses tab when no course is selected and user tries to access other tabs
  const handleTabChange = (value: string) => {
    if ((value === 'lessons' || value === 'assignments' || value === 'settings') && !selectedCourseId) {
      // Don't allow switching to these tabs without a selected course
      return;
    }
    setActiveTab(value);
  };

  // Don't show loading after initial load is complete
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
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger 
            value="lessons" 
            className="flex items-center gap-2" 
            disabled={!selectedCourseId}
          >
            <Video className="h-4 w-4" />
            Lessons
            {selectedCourse && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                {selectedCourse.title.length > 10 ? selectedCourse.title.substring(0, 10) + '...' : selectedCourse.title}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="assignments" 
            className="flex items-center gap-2" 
            disabled={!selectedCourseId}
          >
            <FileText className="h-4 w-4" />
            Assignments
            {selectedCourse && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1 rounded">
                {selectedCourse.title.length > 10 ? selectedCourse.title.substring(0, 10) + '...' : selectedCourse.title}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2" 
            disabled={!selectedCourseId}
          >
            <Settings className="h-4 w-4" />
            Settings
            {selectedCourse && (
              <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-1 rounded">
                {selectedCourse.title.length > 10 ? selectedCourse.title.substring(0, 10) + '...' : selectedCourse.title}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <CourseManagement 
            onCourseSelect={(courseId) => {
              setSelectedCourseId(courseId);
              console.log('Course selected:', courseId);
            }} 
          />
          {selectedCourse && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Selected Course: {selectedCourse.title}</span>
                </div>
                <p className="text-sm text-emerald-600 mt-1">
                  You can now manage lessons and assignments for this course using the tabs above.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          {selectedCourse ? (
            <LessonManagement 
              courseId={selectedCourse.id} 
              courseName={selectedCourse.title}
            />
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a course first</h3>
                <p className="text-gray-600">Go to the Courses tab and select a course to manage its lessons.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {selectedCourse ? (
            <AssignmentManagement 
              courseId={selectedCourse.id} 
              courseName={selectedCourse.title}
            />
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a course first</h3>
                <p className="text-gray-600">Go to the Courses tab and select a course to manage its assignments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {selectedCourse ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Course Settings - {selectedCourse.title}
                </CardTitle>
                <CardDescription>
                  Configure advanced course settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <h4 className="font-medium mb-2">Course Information</h4>
                    <p><strong>ID:</strong> {selectedCourse.id}</p>
                    <p><strong>Created:</strong> {new Date(selectedCourse.created_at).toLocaleDateString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(selectedCourse.updated_at).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> {selectedCourse.category}</p>
                    <p><strong>Level:</strong> {selectedCourse.level}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <h4 className="font-medium mb-2">Statistics</h4>
                    <p><strong>Students Enrolled:</strong> {selectedCourse.student_count}</p>
                    <p><strong>Average Rating:</strong> {selectedCourse.rating}/5</p>
                    <p><strong>Total Lessons:</strong> {selectedCourse.total_lessons}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a course first</h3>
                <p className="text-gray-600">Go to the Courses tab and select a course to view its settings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCourseManagement;
