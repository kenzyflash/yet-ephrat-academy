
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Download, Eye, Calendar, User, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseData } from '@/hooks/useCourseData';
import { useToast } from '@/hooks/use-toast';

const CertificateGenerator = () => {
  const { user } = useAuth();
  const { courses, enrollments } = useCourseData();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Get completed courses (progress = 100%)
  const completedCourses = courses.filter(course => {
    const enrollment = enrollments.find(e => e.course_id === course.id);
    return enrollment && enrollment.progress >= 100;
  });

  const generateCertificate = (course: any) => {
    setSelectedCourse(course);
    setIsPreviewOpen(true);
  };

  const downloadCertificate = () => {
    if (!selectedCourse) return;

    // In a real app, this would generate a PDF
    toast({
      title: "Certificate Downloaded",
      description: `Certificate for ${selectedCourse.title} has been downloaded.`
    });
  };

  const printCertificate = () => {
    window.print();
  };

  const CertificatePreview = ({ course }: { course: any }) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div 
        ref={certificateRef}
        className="bg-white p-8 border-8 border-yellow-400 rounded-lg shadow-2xl max-w-4xl mx-auto"
        style={{ aspectRatio: '4/3' }}
      >
        <div className="text-center space-y-6">
          <div className="border-b-4 border-yellow-400 pb-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">CERTIFICATE OF COMPLETION</h1>
            <p className="text-lg text-gray-600">SafHub Educational Platform</p>
          </div>

          <div className="py-8 space-y-6">
            <div className="text-xl text-gray-700">This is to certify that</div>
            
            <div className="text-4xl font-bold text-emerald-600 border-b-2 border-gray-300 inline-block px-8 py-2">
              {user?.email?.split('@')[0] || 'Student Name'}
            </div>

            <div className="space-y-4">
              <div className="text-xl text-gray-700">has successfully completed the course</div>
              
              <div className="text-3xl font-bold text-gray-800 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                {course.title}
              </div>

              <div className="text-lg text-gray-600">
                Instructor: <span className="font-semibold">{course.instructor_name}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end pt-8 border-t-2 border-gray-200">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 w-48">
                <p className="text-sm text-gray-600">Date of Completion</p>
                <p className="font-semibold">{currentDate}</p>
              </div>
            </div>

            <div className="text-center">
              <Award className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Official Seal</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 w-48">
                <p className="text-sm text-gray-600">Authorized Signature</p>
                <p className="font-semibold">SafHub Administration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Certificate Generator
        </CardTitle>
        <CardDescription>
          Generate certificates for completed courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {completedCourses.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Certificates Available</h3>
            <p className="text-gray-500">Complete a course to generate your first certificate!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              You have {completedCourses.length} certificate(s) available for download.
            </p>
            
            {completedCourses.map((course) => {
              const enrollment = enrollments.find(e => e.course_id === course.id);
              
              return (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <img 
                      src={course.image_url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {course.instructor_name}</p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Award className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                        <div className="text-sm text-gray-500">
                          Progress: {Math.round(enrollment?.progress || 0)}%
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog open={isPreviewOpen && selectedCourse?.id === course.id} onOpenChange={setIsPreviewOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generateCertificate(course)}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl">
                            <DialogHeader>
                              <DialogTitle>Certificate Preview</DialogTitle>
                              <DialogDescription>
                                Preview your certificate before downloading
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedCourse && <CertificatePreview course={selectedCourse} />}
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={printCertificate}>
                                Print Certificate
                              </Button>
                              <Button onClick={downloadCertificate} className="bg-emerald-600 hover:bg-emerald-700">
                                <Download className="mr-1 h-4 w-4" />
                                Download PDF
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => generateCertificate(course)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;
