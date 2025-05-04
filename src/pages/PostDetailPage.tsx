import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getItem, fetchComments } from '@/api/hackerNewsApi'; // Import fetchComments
import { HNItem } from '@/types';
import CommentItem from '@/components/CommentItem';
import CommentItemSkeleton from '@/components/CommentItemSkeleton'; // Import the skeleton component
import Header from '@/components/Header'; // Import Header
import AISummarizer from '@/components/AISummarizer'; // Import AISummarizer

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<HNItem | null>(null);
  const [comments, setComments] = useState<HNItem[]>([]); // State for the full comment tree
  const [loadingPost, setLoadingPost] = useState<boolean>(true);
  const [loadingComments, setLoadingComments] = useState<boolean>(false); // Separate loading state for comments
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0); // Track retry attempts

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id) return;
      setLoadingPost(true);
      setLoadingComments(true); // Start loading comments
      setError(null);
      setComments([]); // Reset comments

      try {
        // Fetch the main post
        const postData = await getItem(parseInt(id, 10));
        setPost(postData);
        setLoadingPost(false); // Post finished loading

        // If post exists and has comments, fetch them
        if (postData && postData.kids && postData.kids.length > 0) {
          const fetchedComments = await fetchComments(postData.kids);
          setComments(fetchedComments);
        } else {
          // No comments or post doesn't exist
          setComments([]);
        }
      } catch (err) {
        console.error("Error fetching post details or comments:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const is500Error = errorMessage.includes('500') || errorMessage.includes('Internal Server Error');
        
        setError(
          is500Error 
            ? 'Server error (500). The server might be temporarily unavailable.'
            : 'Failed to load post details or comments.'
        );
        setLoadingPost(false); // Ensure loading stops on error
      }
      setLoadingComments(false); // Comments finished loading (or failed)
    };

    fetchPostAndComments();
  }, [id, retryCount]); // Re-run effect if id changes or retry is triggered
  
  // Function to allow user to retry loading the post
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // More precise time formatting function (example, might need refinement)
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp * 1000).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago"; // HN uses 'hours'
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const timeAgo = post?.time ? formatTimeAgo(post.time) : '';
  const domain = post?.url ? `(${new URL(post.url).hostname})` : '';

  return (
    <div className="min-h-screen bg-[#f6f6ef] flex justify-center">
      <div className="w-full md:w-4/5 lg:w-[85%] bg-[#f6f6ef]">
        <Header /> {/* Add the Header component */}
        <div className="h-hn-gutter"></div> {/* Add spacer */} 
        <main className="p-hn-item-padding"> {/* Wrap content in main */}
      {loadingPost ? (
        <p className="text-hn-gray p-4">Loading post...</p>
      ) : error ? (
        <div className="text-red-500 p-4">
          <p className="mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-hn-orange text-white px-3 py-1 rounded hover:bg-orange-600 text-sm"
          >
            Retry
          </button>
        </div>
      ) : post ? (
        <div className="mb-4">
          {/* Render PostItem-like header for the main post */}
          <div className="text-hn-normal mb-0.5 flex items-center"> {/* Reduced mb and added flex */}
            <span className="text-hn-gray mr-1">▲</span> {/* Actual upvote triangle */}
            <a href={post.url || `/post/${post.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {post.title}
            </a>
            {post.url && <span className="text-hn-gray text-hn-small ml-1">{domain}</span>}
          </div>
          <div className="text-hn-small text-hn-gray ml-hn-rank-width pl-1"> {/* Adjusted margin/padding if needed */}
            <span>{post.score} points</span>
            <span className="mx-1">by</span>
            <span className="hover:underline cursor-pointer">{post.by}</span>
            <span className="mx-1">{timeAgo}</span>
            {/* Added hide/past/favorite links */}
            <span className="mx-1">|</span>
            <span className="hover:underline cursor-pointer">hide</span>
            <span className="mx-1">|</span>
            <span className="hover:underline cursor-pointer">past</span>
            <span className="mx-1">|</span>
            <span className="hover:underline cursor-pointer">favorite</span>
            <span className="mx-1">|</span>
            <span className="hover:underline cursor-pointer">{post.descendants ?? 0}&nbsp;comments</span>
          </div>

          {/* Render post text if it exists (self-post) */}
          {post.text && (
            <div
              className="text-hn-normal mt-2 ml-hn-rank-width pl-1 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: post.text }}
            />
          )}

          {/* Add AI Summarizer */}
          {post && <AISummarizer postId={post.id} />}

          {/* Add Comment Area */} 
          <div className="mt-4 ml-hn-rank-width pl-1"> {/* Added margin to align with comments */} 
            <textarea 
              rows={4} 
              cols={80} 
              className="border border-gray-400 p-1 text-hn-normal w-full md:w-auto" /* Basic styling, HN uses browser defaults */
              aria-label="Add a comment"
            ></textarea>
            <div className="mt-1"> {/* Spacing for button */} 
              <button 
                type="button" 
                /* className removed for browser default look */
              >
                add comment
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-4 pt-2">
            {loadingComments ? (
              // Show skeletons while comments are loading
              <div className="ml-hn-rank-width pl-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <CommentItemSkeleton key={index} level={0} />
                ))}
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} depth={0} />
              ))
            ) : (
              !loadingPost && <p className="text-hn-gray ml-hn-rank-width pl-1">No comments yet.</p> // Show only after post loads
            )}
          </div>
        </div>
      ) : (
        <p className="text-hn-gray p-4">Post not found.</p>
      )}
        </main> {/* Close the main tag */}

        <div className="h-hn-gutter"></div>

      </div>
    </div>
  );
};

export default PostDetailPage;