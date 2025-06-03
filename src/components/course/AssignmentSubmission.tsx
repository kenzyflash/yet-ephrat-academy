
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  submitted_at: string;
}

interface AssignmentSubmissionProps {
  courseId: string;
}

const AssignmentSubmission = ({ courseId }: AssignmentSubmissionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
    if (user) {
      fetchSubmissions();
    }
  }, [courseId, user]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleFileUpload = async (assignmentId: string, file: File) => {
    if (!user) return;

    // Validate file type
    const allowedTypes = ['.docx', '.ppt', '.pptx', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Only .docx, .ppt, .pptx, and .pdf files are allowed",
        variant: "destructive"
      });
      return;
    }

    setUploading(assignmentId);

    try {
      // Upload file to Supabase storage
      const fileName = `${user.id}/${assignmentId}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-files')
        .getPublicUrl(fileName);

      // Save submission to database
      const { error: dbError } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          user_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          file_type: fileExtension
        });

      if (dbError) throw dbError;

      await fetchSubmissions();
      
      toast({
        title: "Assignment submitted",
        description: "Your assignment has been uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading assignment:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const isSubmitted = (assignmentId: string) => {
    return submissions.some(sub => sub.assignment_id === assignmentId);
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No assignments available for this course yet.
          </p>
        ) : (
          assignments.map((assignment) => {
            const submitted = isSubmitted(assignment.id);
            const submission = getSubmission(assignment.id);
            const overdue = isOverdue(assignment.due_date);

            return (
              <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      {overdue && !submitted && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                      {submitted && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Submitted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {submitted && submission ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Submitted:</strong> {submission.file_name}
                    </p>
                    <p className="text-xs text-green-600">
                      Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload your assignment (.docx, .ppt, .pptx, .pdf)
                    </p>
                    <Input
                      type="file"
                      accept=".docx,.ppt,.pptx,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(assignment.id, file);
                        }
                      }}
                      disabled={uploading === assignment.id || !user}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {uploading === assignment.id && (
                      <p className="text-sm text-blue-600">Uploading...</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentSubmission;
