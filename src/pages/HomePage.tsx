import React, { useState, useEffect } from 'react';
// Link is imported within Header
import { getTopStoryIds, getItem } from '@/api/hackerNewsApi';
import { HNItem } from '@/types';
import PostItem from '@/components/PostItem';
import PostItemSkeleton from '@/components/PostItemSkeleton'; // Import the skeleton component
import Header from '@/components/Header'; // Import the Header component


const POSTS_PER_PAGE = 30;

const HomePage: React.FC = () => {
  const [storyIds, setStoryIds] = useState<number[]>([]);
  const [items, setItems] = useState<HNItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(POSTS_PER_PAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    const fetchStoryIds = async () => {
      try {
        setLoading(true);
        const ids = await getTopStoryIds();
        setStoryIds(ids);
      } catch (error) {
        console.error('Error fetching story IDs:', error);
        // Handle error state appropriately, e.g., show an error message
      } finally {
        // Initial loading done after fetching IDs, item fetching will handle its own loading
        setLoading(false);
      }
    };
    fetchStoryIds();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (storyIds.length === 0) return;

      setLoadingMore(true); // Indicate loading more items
      const idsToFetch = storyIds.slice(0, visibleCount);

      try {
        const fetchedItemsPromises = idsToFetch.map(id => getItem(id));
        const results = await Promise.all(fetchedItemsPromises);
        // Filter out null results (items that failed to fetch or don't exist)
        const validItems = results.filter((item): item is HNItem => item !== null);
        setItems(validItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        // Handle error state
      } finally {
        setLoadingMore(false);
      }
    };

    fetchItems();
  }, [storyIds, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + POSTS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-[#f6f6ef] flex justify-center">
      <div className="w-full md:w-4/5 lg:w-[85%] bg-[#f6f6ef]">
        {/* Use Header Component */}
        <Header />

        {/* Spacer */}
        <div className="h-hn-gutter"></div>

        {/* Main Content - Post List */}
        <main className="p-hn-item-padding">
          {loading && items.length === 0 ? (
            // Show skeletons during initial load
            <ol className="list-none p-0 m-0">
              {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
                <PostItemSkeleton key={index} />
              ))}
            </ol>
          ) : (
            <ol className="list-none p-0 m-0">
              {items.map((item, index) => (
                <PostItem key={item.id} item={item} rank={index + 1} />
              ))}
            </ol>
          )}
          {/* More Button/Link */}
          <div className="mt-4 ml-[calc(theme(spacing.hn-rank-width)+theme(spacing.hn-arrow-size)+4px)] text-hn-normal">
            {/* Adjust margin-left based on rank width, arrow width, and spacing. Use ml-hn-more-margin or similar if defined */}
            {loadingMore ? (
              // Optionally show skeletons when loading more, or just text
              <span className="text-hn-gray">Loading more...</span>
            ) : (
              visibleCount < storyIds.length && (
                <button onClick={loadMore} className="text-hn-orange hover:underline focus:outline-none">
                  More
                </button>
              )
            )}
          </div>
        </main>

        {/* Spacer */}
        <div className="h-hn-gutter"></div>

        {/* Use Footer Component */}
  
      </div>
    </div>
  );
};

export default HomePage;