
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

  const downloadCertificate = async () => {
    if (!selectedCourse || !certificateRef.current) return;

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to download the certificate.",
          variant: "destructive"
        });
        return;
      }

      // Get the certificate HTML content
      const certificateContent = certificateRef.current.outerHTML;
      
      // Create the print document
      const printDocument = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${selectedCourse.title}</title>
            <meta charset="utf-8">
            <style>
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: system-ui, -apple-system, sans-serif;
                }
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
              }
              .bg-white { background-color: white; }
              .p-8 { padding: 2rem; }
              .border-8 { border-width: 8px; }
              .border-yellow-400 { border-color: #facc15; }
              .rounded-lg { border-radius: 0.5rem; }
              .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
              .max-w-4xl { max-width: 56rem; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .text-center { text-align: center; }
              .space-y-6 > * + * { margin-top: 1.5rem; }
              .space-y-4 > * + * { margin-top: 1rem; }
              .border-b-4 { border-bottom-width: 4px; }
              .pb-4 { padding-bottom: 1rem; }
              .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
              .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
              .text-2xl { font-size: 1.5rem; line-height: 2rem; }
              .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
              .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
              .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .text-gray-800 { color: #1f2937; }
              .text-gray-700 { color: #374151; }
              .text-gray-600 { color: #4b5563; }
              .text-gray-400 { color: #9ca3af; }
              .text-emerald-600 { color: #059669; }
              .text-yellow-500 { color: #eab308; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-4 { margin-bottom: 1rem; }
              .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
              .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
              .px-8 { padding-left: 2rem; padding-right: 2rem; }
              .p-4 { padding: 1rem; }
              .pt-8 { padding-top: 2rem; }
              .pt-2 { padding-top: 0.5rem; }
              .border-b-2 { border-bottom-width: 2px; }
              .border-t-2 { border-top-width: 2px; }
              .border-2 { border-width: 2px; }
              .border-gray-300 { border-color: #d1d5db; }
              .border-gray-200 { border-color: #e5e7eb; }
              .border-gray-400 { border-color: #9ca3af; }
              .border-yellow-200 { border-color: #fef3c7; }
              .inline-block { display: inline-block; }
              .bg-yellow-50 { background-color: #fefce8; }
              .rounded-lg { border-radius: 0.5rem; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-end { align-items: flex-end; }
              .w-48 { width: 12rem; }
              .h-16 { height: 4rem; }
              .w-16 { width: 4rem; }
              .mb-2 { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            ${certificateContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `;

      // Write the document and trigger print
      printWindow.document.write(printDocument);
      printWindow.document.close();

      toast({
        title: "Certificate Download Started",
        description: `Certificate for ${selectedCourse.title} is being prepared for download. Use your browser's print dialog to save as PDF.`
      });

    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Error",
        description: "There was an error preparing your certificate for download.",
        variant: "destructive"
      });
    }
  };

  const printCertificate = () => {
    downloadCertificate();
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
                          onClick={() => {
                            setSelectedCourse(course);
                            downloadCertificate();
                          }}
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
