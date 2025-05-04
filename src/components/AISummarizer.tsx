import React, { useState } from 'react';
import axios from 'axios';

interface AISummarizerProps {
  postId: number;
}

const AISummarizer: React.FC<AISummarizerProps> = ({ postId }) => {
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state variables for comment summarization
  const [showCommentSummary, setShowCommentSummary] = useState<boolean>(false);
  const [commentSummary, setCommentSummary] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleToggleSummary = async () => {
    // If summary is already shown, just toggle visibility
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    
    // If we need to fetch the summary
    setShowSummary(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/summarize', { postId });
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // New function to handle comment summarization
  const handleToggleCommentSummary = async () => {
    // If comment summary is already shown, just toggle visibility
    if (commentSummary) {
      setShowCommentSummary(!showCommentSummary);
      return;
    }
    
    // If we need to fetch the comment summary
    setShowCommentSummary(true);
    setCommentLoading(true);
    setCommentError(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/summarize-comments', { postId });
      setCommentSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching comment summary:', err);
      setCommentError('Failed to generate comment summary. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="mt-4 ml-hn-rank-width pl-1">
      <div className="flex space-x-4">
        <button 
          onClick={handleToggleSummary}
          className="text-hn-small text-hn-gray hover:underline"
        >
          {showSummary ? 'Hide AI Summary' : 'Show AI Summary'}
        </button>
        
        <button 
          onClick={handleToggleCommentSummary}
          className="text-hn-small text-hn-gray hover:underline"
        >
          {showCommentSummary ? 'Hide Comment Summary' : 'Summarize Comments'}
        </button>
      </div>
      
      {showSummary && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-pulse h-4 w-4 bg-hn-orange rounded-full mr-2"></div>
              <span className="text-hn-gray">Generating summary...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-hn-small">{error}</div>
          ) : (
            <p className="text-hn-normal">{summary}</p>
          )}
        </div>
      )}
      
      {showCommentSummary && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
          {commentLoading ? (
            <div className="flex items-center">
              <div className="animate-pulse h-4 w-4 bg-hn-orange rounded-full mr-2"></div>
              <span className="text-hn-gray">Generating comment summary...</span>
            </div>
          ) : commentError ? (
            <div className="text-red-500 text-hn-small">{commentError}</div>
          ) : (
            <div className="text-hn-normal">
              <h4 className="font-medium mb-2">Comment Summary:</h4>
              <p>{commentSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISummarizer;