
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Download, Eye, Calendar, User, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseData } from '@/hooks/useCourseData';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateGenerator = () => {
  const { user } = useAuth();
  const { courses, enrollments } = useCourseData();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isQuickDownload, setIsQuickDownload] = useState(false);
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
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "No course selected. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress('Preparing certificate...');
    
    try {
      toast({
        title: "Starting Download",
        description: "Generating your certificate PDF...",
      });

      setDownloadProgress('Preparing certificate layout...');
      console.log('Starting certificate generation for:', selectedCourse.title);
      
      // Wait for the certificate element to be rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if certificate ref is available
      if (!certificateRef.current) {
        throw new Error('Certificate preview not ready. Please try again.');
      }

      setDownloadProgress('Capturing certificate image...');
      
      // Create canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied to the cloned document
          const clonedElement = clonedDoc.querySelector('[data-certificate]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.position = 'relative';
          }
        }
      });

      setDownloadProgress('Creating PDF document...');
      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

      // Create PDF in landscape orientation (A4)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 landscape dimensions in mm
      const pdfWidth = 297;
      const pdfHeight = 210;
      
      // Calculate dimensions to fit the certificate properly
      const imgAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let imgWidth, imgHeight, offsetX, offsetY;
      
      if (imgAspectRatio > pdfAspectRatio) {
        // Image is wider than PDF
        imgWidth = pdfWidth;
        imgHeight = pdfWidth / imgAspectRatio;
        offsetX = 0;
        offsetY = (pdfHeight - imgHeight) / 2;
      } else {
        // Image is taller than PDF
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * imgAspectRatio;
        offsetX = (pdfWidth - imgWidth) / 2;
        offsetY = 0;
      }

      setDownloadProgress('Finalizing PDF...');
      
      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);

      // Generate filename with safe characters
      const safeTitle = selectedCourse.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `Certificate_${safeTitle}_${new Date().getFullYear()}.pdf`;

      setDownloadProgress('Downloading...');
      console.log('Saving PDF as:', filename);

      // Save the PDF
      pdf.save(filename);

      // Show success message
      toast({
        title: "Certificate Downloaded!",
        description: `Your certificate for "${selectedCourse.title}" has been saved as ${filename}`,
      });

      console.log('Certificate download completed successfully');

      // If it was a quick download, close the hidden dialog
      if (isQuickDownload) {
        setIsPreviewOpen(false);
        setIsQuickDownload(false);
      }

    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error generating your certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  const quickDownload = async (course: any) => {
    setSelectedCourse(course);
    setIsQuickDownload(true);
    setIsPreviewOpen(true);
    
    // Wait for the dialog to render and then start download
    setTimeout(() => {
      downloadCertificate();
    }, 100);
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
        data-certificate="true"
        className="bg-white p-8 border-8 border-yellow-400 rounded-lg shadow-2xl max-w-4xl mx-auto"
        style={{ aspectRatio: '4/3', minWidth: '800px' }}
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
          Generate and download certificates for completed courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isDownloading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">Generating Certificate</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">{downloadProgress}</p>
          </div>
        )}

        {completedCourses.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Certificates Available</h3>
            <p className="text-gray-500">Complete a course to generate your first certificate!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700">
                <Award className="h-4 w-4" />
                <span className="font-medium">
                  {completedCourses.length} certificate(s) ready for download
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Click "Download PDF" to save your certificates to your device
              </p>
            </div>
            
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
                        <Dialog open={isPreviewOpen && selectedCourse?.id === course.id && !isQuickDownload} onOpenChange={setIsPreviewOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generateCertificate(course)}
                              disabled={isDownloading}
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
                              <Button 
                                onClick={downloadCertificate} 
                                disabled={isDownloading}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Generating PDF...
                                  </>
                                ) : (
                                  <>
                                    <Download className="mr-1 h-4 w-4" />
                                    Download PDF
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={isDownloading}
                          onClick={() => quickDownload(course)}
                        >
                          {isDownloading && selectedCourse?.id === course.id ? (
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="mr-1 h-4 w-4" />
                              Download PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Hidden dialog for quick downloads */}
        <Dialog open={isPreviewOpen && isQuickDownload} onOpenChange={() => {}}>
          <DialogContent className="max-w-5xl fixed opacity-0 pointer-events-none -z-10">
            <DialogHeader className="sr-only">
              <DialogTitle>Certificate Generation</DialogTitle>
              <DialogDescription>Generating certificate for download</DialogDescription>
            </DialogHeader>
            {selectedCourse && <CertificatePreview course={selectedCourse} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;
