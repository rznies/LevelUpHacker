// API utility functions for Hacker News
import { getCache, setCache } from '../utils/cache'; // Import cache utilities
import { HNItem } from '../types';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

// --- Retry Logic Helper ---
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 100;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options?: RequestInit): Promise<Response> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Don't retry on 4xx errors, they are likely client-side issues or non-existent resources
        if (response.status >= 400 && response.status < 500) {
          console.warn(`[Fetch Retry] Client error ${response.status} for ${url}. Not retrying.`);
          return response; // Return the response for the caller to handle
        }
        
        // Special handling for 500 errors - they might be temporary server issues
        if (response.status === 500) {
          console.warn(`[Fetch Retry] Server error 500 for ${url}. Will retry.`);
          throw new Error(`HTTP error 500: Internal Server Error`);
        }
        
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      return response; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[Fetch Retry] Attempt ${attempt + 1} failed for ${url}: ${lastError.message}`);
      if (attempt < MAX_RETRIES - 1) {
        // Use exponential backoff with jitter for more effective retries
        const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt) * jitter;
        console.log(`[Fetch Retry] Retrying in ${Math.floor(backoffTime)}ms...`);
        await sleep(Math.floor(backoffTime));
      } else {
        console.error(`[Fetch Retry] Max retries reached for ${url}.`);
      }
    }
  }
  // If all retries fail, throw the last encountered error
  throw lastError || new Error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts`);
};

// --- API Functions with Caching and Retry ---

const TOP_STORIES_CACHE_KEY = 'top_story_ids';
const TOP_STORIES_TTL_MINUTES = 5;

export const getTopStoryIds = async (): Promise<number[]> => {
  // Try fetching from cache first
  const cachedIds = getCache<number[]>(TOP_STORIES_CACHE_KEY);
  if (cachedIds) {
    return cachedIds;
  }

  // If not in cache or expired, fetch from API
  try {
    const response = await fetchWithRetry(`${BASE_URL}/topstories.json`);
    // fetchWithRetry throws on persistent error, so we assume response is ok here
    const ids = await response.json() as number[];

    // Store in cache
    setCache(TOP_STORIES_CACHE_KEY, ids, TOP_STORIES_TTL_MINUTES);

    return ids;
  } catch (error) {
    console.error(`[API Error] Failed to getTopStoryIds:`, error);
    throw new Error(`Failed to fetch top story IDs after retries. ${error instanceof Error ? error.message : ''}`); // Re-throw a more specific error
  }

  
}

// Function to fetch Ask HN story IDs
export const getAskStoryIds = async (): Promise<number[]> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/askstories.json`);
    const ids: number[] = await response.json();
    return ids;
  } catch (error) {
    console.error(`[API Error] Failed to getAskStoryIds:`, error);
    throw new Error(`Failed to fetch Ask HN story IDs after retries. ${error instanceof Error ? error.message : ''}`);
  }
};

// Function to fetch Show HN story IDs
export const getShowStoryIds = async (): Promise<number[]> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/showstories.json`);
    const ids: number[] = await response.json();
    return ids;
  } catch (error) {
    console.error(`[API Error] Failed to getShowStoryIds:`, error);
    throw new Error(`Failed to fetch Show HN story IDs after retries. ${error instanceof Error ? error.message : ''}`);
  }
};

// Function to fetch Job story IDs
export const getJobStoryIds = async (): Promise<number[]> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/jobstories.json`);
    const ids: number[] = await response.json();
    return ids;
  } catch (error) {
    console.error(`[API Error] Failed to getJobStoryIds:`, error);
    throw new Error(`Failed to fetch Job story IDs after retries. ${error instanceof Error ? error.message : ''}`);
  }
};


const ITEM_CACHE_PREFIX = 'item_';
const ITEM_TTL_MINUTES = 15;

export const getItem = async (id: number): Promise<HNItem | null> => {
  const cacheKey = `${ITEM_CACHE_PREFIX}${id}`;

  // Try fetching from cache first
  const cachedItem = getCache<HNItem>(cacheKey);
  if (cachedItem) {
    return cachedItem;
  }

  // If not in cache or expired, fetch from API
  try {
    const response = await fetchWithRetry(`${BASE_URL}/item/${id}.json`);

    // Handle cases where the item might not exist (404) even after retry
    if (!response.ok) {
        // fetchWithRetry returns non-ok responses for 4xx errors
        console.warn(`[API Warning] Failed to fetch item ${id} after retries: ${response.status} ${response.statusText}`);
        // Optionally cache 'not found' state here if desired
        return null;
    }

    const item = await response.json() as HNItem;

  // HN API might return null for deleted items, handle this
  if (!item) {
      console.warn(`Item ${id} fetched as null.`);
      // Optionally cache this null state for a short period if needed
      return null;
  }

  // Store the valid item in cache
    setCache(cacheKey, item, ITEM_TTL_MINUTES);

    return item;
  } catch (error) {
    // This catch block handles errors thrown by fetchWithRetry (e.g., network errors, 5xx errors after retries)
    console.error(`[API Error] Failed to getItem ${id}:`, error);
    // Do not throw here, let the caller handle the null return
    return null;
  }
};

const COMMENTS_CACHE_PREFIX = 'comments_';
const COMMENTS_TTL_MINUTES = 10;

/**
 * Fetches a comment and its nested children recursively.
 * @param commentId The ID of the comment to fetch.
 * @returns The comment item with its fetched children, or null if fetching fails.
 */
const fetchCommentRecursive = async (commentId: number): Promise<HNItem | null> => {
  const comment = await getItem(commentId); // Reuse getItem which handles individual item caching
  if (!comment || comment.deleted || comment.dead) {
    return null; // Skip deleted or dead comments
  }

  if (comment.kids && comment.kids.length > 0) {
    // Fetch children recursively and filter out null results
    const childComments = await Promise.all(
      comment.kids.map(kidId => fetchCommentRecursive(kidId))
    );
    // Assign the fetched, non-null children back to the comment
    // Assign the fetched, non-null children to the 'kidsData' property
    // This keeps the original 'kids' (IDs) intact and stores fetched objects separately
    comment.kidsData = childComments.filter(child => child !== null);
  }

  return comment;
};

/**
 * Fetches a list of top-level comments and their nested children for a post.
 * Uses caching to store the entire comment thread.
 * @param topLevelCommentIds An array of IDs for the top-level comments.
 * @returns An array of top-level comment items, each potentially containing nested children.
 */
export const fetchComments = async (topLevelCommentIds: number[]): Promise<HNItem[]> => {
  // Generate a cache key based on the sorted list of top-level IDs
  const sortedIds = [...topLevelCommentIds].sort((a, b) => a - b);
  const cacheKey = `${COMMENTS_CACHE_PREFIX}${sortedIds.join('_')}`;

  // Try fetching the entire thread from cache first
  const cachedComments = getCache<HNItem[]>(cacheKey);
  if (cachedComments) {
    return cachedComments;
  }

  // If not in cache, fetch all top-level comments and their children
  try {
    // Note: fetchCommentRecursive internally uses getItem, which now has retry logic.
    // Promise.all will fail fast if any recursive fetch ultimately fails after retries.
    const commentPromises = topLevelCommentIds.map(id => fetchCommentRecursive(id));
    const comments = await Promise.all(commentPromises);

    // Filter out any null results (e.g., failed fetches, deleted/dead comments)
    const validComments = comments.filter((comment): comment is HNItem => comment !== null);

    // Store the fetched comment tree in cache
    setCache(cacheKey, validComments, COMMENTS_TTL_MINUTES);

    return validComments;
  } catch (error) {
      console.error(`[API Error] Failed to fetchComments for IDs [${topLevelCommentIds.join(', ')}]:`, error);
      // Depending on requirements, you might return an empty array or re-throw
      // Returning empty array to allow the UI to show 'Could not load comments'
      return [];
      // OR: throw new Error(`Failed to fetch comments after retries. ${error instanceof Error ? error.message : ''}`);
  }
};