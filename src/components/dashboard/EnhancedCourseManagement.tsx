
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Video, FileText, Settings } from 'lucide-react';
import CourseManagement from './CourseManagement';
import LessonManagement from './LessonManagement';
import AssignmentManagement from './AssignmentManagement';
import { useCourseData } from '@/hooks/useCourseData';

const EnhancedCourseManagement = () => {
  const { courses, loading } = useCourseData();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('courses');

  const selectedCourse = courses.find(course => course.id === selectedCourseId);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2" disabled={!selectedCourseId}>
            <Video className="h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2" disabled={!selectedCourseId}>
            <FileText className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!selectedCourseId}>
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <CourseManagement onCourseSelect={setSelectedCourseId} />
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
