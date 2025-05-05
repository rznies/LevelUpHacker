import React, { useState, useEffect } from 'react';
// Link is used within Header
import { getJobStoryIds, getItem } from '@/api/hackerNewsApi';
import { HNItem } from '@/types';
import PostItem from '@/components/PostItem';
import Header from '@/components/Header'; // Import Header

// const POSTS_PER_PAGE = 30; // Jobs page might show all or paginate differently

const JobsPage: React.FC = () => {
  const [storyIds, setStoryIds] = useState<number[]>([]);
  const [items, setItems] = useState<HNItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStoryIds = async () => {
      try {
        setLoading(true);
        const ids = await getJobStoryIds(); 
        setStoryIds(ids);
      } catch (error) {
        console.error('Error fetching Job story IDs:', error);
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

      // Jobs page typically loads all items, so we fetch based on storyIds length
      // No 'loadingMore' state needed if we load all at once
      const idsToFetch = storyIds; // Fetch all job IDs

      if (idsToFetch.length === 0) {
        return; // Nothing to fetch
      }

      try {
        // Set loading true only when fetching all items initially
        if (items.length === 0) setLoading(true);

        const fetchedItemsPromises = idsToFetch.map(id => getItem(id)); // Corrected typo: fetchItem -> getItem
        const results = await Promise.all(fetchedItemsPromises);
        // Filter for actual job items after fetching
        const validItems = results.filter((item): item is HNItem => item !== null && item.type === 'job');

        setItems(validItems);

      } catch (error) {
        console.error('Error fetching Job items:', error);
      } finally {
        // Set loading false after fetching is complete
        setLoading(false);
      }
    };

    fetchItems();
  // Depend only on storyIds and the initial loading state
  }, [storyIds, loading]); // Removed visibleCount and items.length dependencies

  // No loadMore function needed for Jobs page if all are loaded
  // const loadMore = () => {
  //   setVisibleCount(prevCount => prevCount + POSTS_PER_PAGE);
  // };

  return (
    <div className="min-h-screen bg-[#f6f6ef] flex justify-center">
      <div className="w-full md:w-4/5 lg:w-[85%] bg-[#f6f6ef]">
        <Header />

        <div className="h-hn-gutter"></div>

        <main className="p-hn-item-padding">
          {loading && storyIds.length === 0 ? (
            <div className="text-center text-hn-gray py-4">Loading Jobs...</div>
          ) : (
            // Jobs list might not need ranking numbers
            <ol className="list-none p-0 m-0">
              {items.map((item) => (
                // Pass a flag or different props if PostItem needs to render jobs differently
                <PostItem key={item.id} item={item} isJobListing={true} /> 
              ))}
            </ol>
          )}
          {/* No 'More' button needed for Jobs page */}
        </main>

        <div className="h-hn-gutter"></div>

      </div>
    </div>
  );
};

export default JobsPage;
