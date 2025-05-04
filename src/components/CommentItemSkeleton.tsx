// src/components/CommentItemSkeleton.tsx
import React from 'react';

interface CommentItemSkeletonProps {
  level: number;
}

const CommentItemSkeleton: React.FC<CommentItemSkeletonProps> = ({ level }) => {
  const indentation = level * 20; // 20px per level

  return (
    <div className="p-2 animate-pulse" style={{ marginLeft: `${indentation}px` }}>
      {/* Metadata Placeholder */}
      <div className="text-hn-small text-hn-gray mb-1 flex space-x-2">
        <div className="h-3 w-16 bg-hn-loading rounded"></div>
        <div className="h-3 w-20 bg-hn-loading rounded"></div>
      </div>
      {/* Comment Text Placeholder */}
      <div className="space-y-1">
        <div className="h-4 w-full bg-hn-loading rounded"></div>
        <div className="h-4 w-5/6 bg-hn-loading rounded"></div>
        <div className="h-4 w-3/4 bg-hn-loading rounded"></div>
      </div>
      {/* Nested Skeleton for potential replies */}
      {level < 2 && (
        <div className="mt-2">
          <CommentItemSkeleton level={level + 1} />
        </div>
      )}
    </div>
  );
};

export default CommentItemSkeleton;