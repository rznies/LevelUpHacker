import React, { useState, useEffect } from 'react';
// Link is used within Header
import { getAskStoryIds, getItem } from '@/api/hackerNewsApi';
import { HNItem } from '@/types';
import PostItem from '@/components/PostItem';
import Header from '@/components/Header'; // Import Header

const POSTS_PER_PAGE = 30;

const AskHNPage: React.FC = () => {
  const [storyIds, setStoryIds] = useState<number[]>([]);
  const [items, setItems] = useState<HNItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(POSTS_PER_PAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    const fetchStoryIds = async () => {
      try {
        setLoading(true);
        // TODO: Implement getAskStoryIds in hackerNewsApi.ts
        const ids = await getAskStoryIds(); 
        setStoryIds(ids);
      } catch (error) {
        console.error('Error fetching Ask HN story IDs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStoryIds();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      // Don't fetch if initial IDs are still loading or no IDs
      if (loading || storyIds.length === 0) return; 

      setLoadingMore(true);
      // Determine which IDs need to be fetched based on the current visible count
      // Fetch only the new slice of IDs needed
      const startIndex = items.length; // Start fetching from the end of currently loaded items
      const endIndex = visibleCount;
      const idsToFetch = storyIds.slice(startIndex, endIndex);

      if (idsToFetch.length === 0) {
        setLoadingMore(false);
        return; // Nothing new to fetch for this range
      }

      try {
        const fetchedItemsPromises = idsToFetch.map(id => getItem(id)); // Corrected typo: fetchItem -> getItem
        const results = await Promise.all(fetchedItemsPromises);
        const validItems = results.filter((item): item is HNItem => item !== null);
        
        // Filter for titles starting with "Ask HN:" AFTER fetching
        const newAskItems = validItems.filter(item => item.title?.startsWith('Ask HN:'));
        
        // Append the newly fetched and filtered items to the existing list
        setItems(prevItems => [...prevItems, ...newAskItems]);

      } catch (error) {
        console.error('Error fetching Ask HN items:', error);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchItems();
  // Depend on storyIds and visibleCount. Also include 'loading' to prevent fetching during initial ID load.
  }, [storyIds, visibleCount, loading, items.length]); // items.length helps trigger fetch for the correct slice

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + POSTS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-[#f6f6ef] flex justify-center">
      <div className="w-full md:w-4/5 lg:w-[85%] bg-[#f6f6ef]">
        <Header />

        <div className="h-hn-gutter"></div>

        <main className="p-hn-item-padding">
          {loading && storyIds.length === 0 ? (
            <div className="text-center text-hn-gray py-4">Loading Ask HN stories...</div>
          ) : (
            <ol className="list-none p-0 m-0">
              {items.map((item, index) => (
                <PostItem key={item.id} item={item} rank={index + 1} />
              ))}
            </ol>
          )}
          <div className="mt-4 ml-[calc(theme(spacing.hn-rank-width)+theme(spacing.hn-arrow-size)+4px)] text-hn-normal">
            {loadingMore ? (
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

        <div className="h-hn-gutter"></div>

      </div>
    </div>
  );
};

export default AskHNPage;