import React from 'react';
import { Link } from 'react-router-dom';
import { HNItem } from '../types';
import UpvoteArrow from './UpvoteArrow';

interface PostItemProps {
  item: HNItem;
  rank?: number; // Rank is optional, especially for jobs
  isJobListing?: boolean; // Flag to indicate if it's a job listing
}

// Helper function to extract domain from URL
const getDomain = (url?: string): string | null => {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    // Remove 'www.' if present
    return domain.replace(/^www\./, '');
  } catch (e) {
    console.error('Invalid URL:', url);
    return null;
  }
};

const PostItem: React.FC<PostItemProps> = ({ item, rank, isJobListing = false }) => {
  const domain = getDomain(item.url);

  // Format time using custom formatTimeAgo function
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

  const timeAgo = item.time ? formatTimeAgo(item.time) : '';

  return (
    <li className="mb-[5px]"> {/* Added bottom margin */}
      <table className="border-collapse text-[10pt] w-full">
        <tbody>
          {/* Title Row */}
          <tr className="align-top">
            {!isJobListing && rank && (
              <td className="pr-[5px] text-right text-[#828282]">
                {rank}.
              </td>
            )}
            {!isJobListing && (
              <td className="pr-[2px] w-[10px] text-center">
                <UpvoteArrow />
              </td>
            )}
            <td className="pb-[2px]" colSpan={isJobListing ? 3 : 1}>
              <span className="leading-[12pt]">
                <a 
                  href={item.url || `/post/${item.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black visited:text-[#828282] hover:underline mr-[3px]"
                >
                  {item.title}
                </a>
                {domain && (
                  <span className="text-[8pt] text-[#828282]">({domain})</span>
                )}
              </span>
            </td>
          </tr>
          {/* Metadata Row */}
          <tr className="h-[14px]">
            <td colSpan={isJobListing ? 1 : 2}></td> {/* Spacer for rank and upvote */}
            <td className="text-[7pt] text-[#828282]">
              {!isJobListing && (
                  <>
                    {item.score} points by{' '}
                    <a href={`/user/${item.by}`} className="text-[#828282] hover:underline">{item.by}</a>{' '}
                    {timeAgo.replace('about ', '')}{' '}
                    |{' '}
                    <a href="#" className="text-[#828282] hover:underline">hide</a>{' '}
                    |{' '}
                    <a href="#" className="text-[#828282] hover:underline">past</a>{' '}
                    {item.descendants !== undefined ? (
                      <>
                        |{' '}
                        <Link to={`/post/${item.id}`} className="text-[#828282] hover:underline">
                          {item.descendants === 0 ? 'discuss' : 
                           item.descendants === 1 ? '1 comment' : 
                           `${item.descendants} comments`}
                        </Link>
                      </>
                    ) : (
                      <>
                        |{' '}
                        <Link to={`/post/${item.id}`} className="text-[#828282] hover:underline">discuss</Link>
                      </>
                    )}
                  </>
                )}
                {isJobListing && (
                  <span>{timeAgo.replace('about ', '')}</span>
                )}
            </td>
          </tr>
        </tbody>
      </table>
    </li>
  );
};

export default PostItem;