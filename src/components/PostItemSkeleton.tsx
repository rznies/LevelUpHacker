// src/components/PostItemSkeleton.tsx
import React from 'react';

const PostItemSkeleton: React.FC = () => {
  return (
    <div className="p-2 flex items-start animate-pulse">
      {/* Rank Placeholder */}
      <div className="text-hn-gray w-hn-rank-width text-right mr-1">
        <div className="h-4 w-4 bg-hn-loading rounded"></div>
      </div>

      {/* Upvote Placeholder */}
      <div className="w-hn-vote-width mr-1 pt-1">
        <div className="h-3 w-3 bg-hn-loading rounded-sm"></div>
      </div>

      {/* Content Placeholder */}
      <div className="flex-1">
        {/* Title Placeholder */}
        <div className="h-5 w-3/4 bg-hn-loading rounded mb-1"></div>
        {/* Metadata Placeholder */}
        <div className="flex space-x-2 text-hn-small">
          <div className="h-3 w-12 bg-hn-loading rounded"></div>
          <div className="h-3 w-16 bg-hn-loading rounded"></div>
          <div className="h-3 w-20 bg-hn-loading rounded"></div>
          <div className="h-3 w-14 bg-hn-loading rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default PostItemSkeleton;