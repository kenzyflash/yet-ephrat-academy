
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, FileText, Calendar, User, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
  due_date: string;
}

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  submitted_at: string;
  assignment: Assignment;
  student_name: string;
}

const SubmissionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('Fetching submissions for teacher:', user.id);

      // Get submissions directly using the RLS policy
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments!inner(
            id,
            title,
            due_date,
            course_id,
            courses!inner(
              id,
              title,
              instructor_id
            )
          )
        `)
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw submissionsError;
      }

      console.log('Raw submissions data:', submissionsData);

      if (!submissionsData || submissionsData.length === 0) {
        console.log('No submissions found');
        setSubmissions([]);
        return;
      }

      // Get student profiles for the submissions
      const userIds = [...new Set(submissionsData.map(sub => sub.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data:', profiles);

      // Create profiles map
      const profilesMap = new Map(
        (profiles || []).map(profile => [
          profile.id,
          `${profile.first_name} ${profile.last_name}`.trim()
        ])
      );

      // Transform submissions data
      const enrichedSubmissions = submissionsData.map(submission => {
        const assignment = submission.assignments;
        const course = assignment?.courses;
        
        return {
          ...submission,
          assignment: {
            id: assignment.id,
            title: assignment.title,
            course_id: assignment.course_id,
            course_title: course?.title || 'Unknown Course',
            due_date: assignment.due_date
          },
          student_name: profilesMap.get(submission.user_id) || 'Unknown Student'
        };
      });

      console.log('Enriched submissions:', enrichedSubmissions);
      setSubmissions(enrichedSubmissions);

      if (showRefreshing) {
        toast({
          title: "Refreshed",
          description: `Found ${enrichedSubmissions.length} submissions`,
        });
      }

    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignment submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSubmissions(true);
  };

  const handleDownload = async (submission: AssignmentSubmission) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = submission.file_url;
      link.download = submission.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `Downloading ${submission.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the file",
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

  const isLateSubmission = (submittedAt: string, dueDate: string) => {
    return new Date(submittedAt) > new Date(dueDate);
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">Loading submissions...</div>
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
              <FileText className="h-5 w-5 text-blue-600" />
              Assignment Submissions
            </CardTitle>
            <CardDescription>
              View and manage student assignment submissions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
            <p>Student submissions will appear here once they start submitting assignments.</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-4"
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Check for submissions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Total submissions: {submissions.length}
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{submission.student_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{submission.assignment.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{submission.assignment.course_title}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{submission.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.submitted_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isLateSubmission(submission.submitted_at, submission.assignment.due_date) ? (
                        <Badge variant="destructive">Late</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">On Time</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog open={isViewDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={setIsViewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Submission Details</DialogTitle>
                              <DialogDescription>
                                Review student submission information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Student</label>
                                    <p className="text-sm">{selectedSubmission.student_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Assignment</label>
                                    <p className="text-sm">{selectedSubmission.assignment.title}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Course</label>
                                    <p className="text-sm">{selectedSubmission.assignment.course_title}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">File Name</label>
                                    <p className="text-sm">{selectedSubmission.file_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">File Type</label>
                                    <p className="text-sm">{selectedSubmission.file_type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Submitted At</label>
                                    <p className="text-sm">{formatDate(selectedSubmission.submitted_at)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                                    <p className="text-sm">{formatDate(selectedSubmission.assignment.due_date)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    {isLateSubmission(selectedSubmission.submitted_at, selectedSubmission.assignment.due_date) ? (
                                      <Badge variant="destructive">Late Submission</Badge>
                                    ) : (
                                      <Badge variant="default" className="bg-green-600">On Time</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={() => handleDownload(selectedSubmission)} className="bg-blue-600 hover:bg-blue-700">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download File
                                  </Button>
                                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                    Close
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(submission)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionManagement;
