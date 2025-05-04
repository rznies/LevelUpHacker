import React, { useState } from 'react';
import { HNItem } from '../types';

interface CommentItemProps {
  comment: HNItem;
  depth: number;
}

// Define the width for indentation (reduced from 40)
const INDENT_WIDTH_PX = 25; 
// const LINE_OFFSET_PX = 20; // Line removed

const CommentItem: React.FC<CommentItemProps> = ({ comment, depth }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Handle deleted or non-existent comments
  if (!comment || comment.deleted || !comment.by) {
    // Apply indentation even for deleted comments
    return (
      <div style={{ paddingLeft: `${depth * INDENT_WIDTH_PX}px` }} className="text-hn-gray text-hn-small py-0.5 relative"> {/* Reduced py */} 
        {/* Vertical line removed */}
        [deleted]
      </div>
    );
  }

  // More precise time formatting function (copied from PostDetailPage for consistency)
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp * 1000).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const timeAgo = comment.time ? formatTimeAgo(comment.time) : '';

  // Use padding for indentation
  const indentationStyle = {
    paddingLeft: `${depth * INDENT_WIDTH_PX}px`,
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if clicking the toggle
    setCollapsed(!collapsed);
  };

  return (
    <div style={indentationStyle} className="text-hn-normal mb-0 relative pt-0.5"> {/* Reduced mb, pt */}
      {/* Vertical line removed */}
      
      {/* Upvote Triangle - positioned slightly above the main content */} 
      <div className="absolute left-0 top-0.5" style={{ marginLeft: `${depth * INDENT_WIDTH_PX - 15}px` }}> {/* Adjust positioning */} 
        <span className="text-hn-gray text-xs">▲</span>
      </div>

      <div className="text-hn-gray text-hn-small mb-0.5"> {/* Comment Header */} 
        <span className="font-semibold cursor-pointer hover:underline">{comment.by}</span>
        <span className="ml-1">{timeAgo}</span>
        <span
          className="ml-1 cursor-pointer hover:underline"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand comment' : 'Collapse comment'}
        >
          {collapsed ? '[+]' : '[-]'} 
        </span>
        {/* Placeholder navigation links */}
        <span className="ml-1">|</span>
        <span className="ml-1 hover:underline cursor-pointer">parent</span>
        <span className="ml-1">|</span>
        {/* <span className="ml-1 hover:underline cursor-pointer">next</span> | prev logic needed */}
        <span className="ml-1 hover:underline cursor-pointer">on:&nbsp;{/* TODO: Link to parent post */}</span>
      </div>

      {!collapsed && (
        <>
          {/* Render comment text, ensuring HTML is parsed safely or sanitized */}
          {/* WARNING: Using dangerouslySetInnerHTML is risky. Sanitize HTML properly in a real app. */}
          <div 
            dangerouslySetInnerHTML={{ __html: comment.text || '' }} 
            className="break-words prose prose-sm max-w-none text-hn-normal mb-1" /* Added mb for reply link spacing */
          />
          
          {/* Reply link positioned below comment text */}
          <div className="text-hn-small underline cursor-pointer mb-1">reply</div>

          {/* Recursively render child comments */}
          {comment.kidsData && comment.kidsData.length > 0 && (
            <div className="mt-0"> {/* Removed mt for tighter spacing */}
              {comment.kidsData.map((reply) => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem;