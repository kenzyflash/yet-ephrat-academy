
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Discussion {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
  hasUpvoted?: boolean;
}

interface CourseDiscussionProps {
  courseId: string;
}

const CourseDiscussion = ({ courseId }: CourseDiscussionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, user]);

  const fetchDiscussions = async () => {
    try {
      // First get discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('course_discussions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;

      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        setLoading(false);
        return;
      }

      // Get user IDs from discussions
      const userIds = discussionsData.map(d => d.user_id);

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Check which discussions the current user has upvoted
      let upvotedIds: string[] = [];
      if (user) {
        const { data: upvotes } = await supabase
          .from('discussion_upvotes')
          .select('discussion_id')
          .eq('user_id', user.id);

        upvotedIds = upvotes?.map(u => u.discussion_id) || [];
      }

      // Combine discussions with profiles and upvote status
      const discussionsWithProfiles = discussionsData.map(discussion => {
        const profile = profilesData?.find(p => p.id === discussion.user_id);
        return {
          ...discussion,
          profiles: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name
          } : null,
          hasUpvoted: upvotedIds.includes(discussion.id)
        };
      });

      setDiscussions(discussionsWithProfiles);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDiscussion = async () => {
    if (!user || !newDiscussion.trim()) return;

    try {
      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          user_id: user.id,
          content: newDiscussion.trim()
        });

      if (error) throw error;

      setNewDiscussion('');
      await fetchDiscussions();
      
      toast({
        title: "Discussion posted",
        description: "Your discussion has been added successfully"
      });
    } catch (error) {
      console.error('Error submitting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to post discussion",
        variant: "destructive"
      });
    }
  };

  const toggleUpvote = async (discussionId: string, hasUpvoted: boolean) => {
    if (!user) return;

    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('discussion_upvotes')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update upvote count
        const { error: updateError } = await supabase.rpc('decrement_upvotes', {
          discussion_id: discussionId
        });

        if (updateError) throw updateError;
      } else {
        // Add upvote
        const { error } = await supabase
          .from('discussion_upvotes')
          .insert({
            discussion_id: discussionId,
            user_id: user.id
          });

        if (error) throw error;

        // Update upvote count
        const { error: updateError } = await supabase.rpc('increment_upvotes', {
          discussion_id: discussionId
        });

        if (updateError) throw updateError;
      }

      await fetchDiscussions();
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast({
        title: "Error",
        description: "Failed to update upvote",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading discussions...</div>;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Course Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Discussion Form */}
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts about this course..."
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={submitDiscussion}
              disabled={!newDiscussion.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Post Discussion
            </Button>
          </div>
        )}

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No discussions yet. Be the first to start a conversation!
            </p>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {discussion.profiles?.first_name?.[0] || 'U'}{discussion.profiles?.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {discussion.profiles?.first_name || 'Unknown'} {discussion.profiles?.last_name || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(discussion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{discussion.content}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUpvote(discussion.id, discussion.hasUpvoted || false)}
                    className={`text-xs ${discussion.hasUpvoted ? 'text-blue-600' : 'text-gray-500'}`}
                    disabled={!user}
                  >
                    <ThumbsUp className={`mr-1 h-3 w-3 ${discussion.hasUpvoted ? 'fill-current' : ''}`} />
                    {discussion.upvotes}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseDiscussion;
