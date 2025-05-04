import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory cache for summaries
const summaryCache = new Map();

// Cache duration (24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Middleware
app.use(cors());
app.use(express.json());

// API route for summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { postId } = req.body;
    
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    // Check if summary exists in cache and is not expired
    const cachedData = summaryCache.get(postId);
    if (cachedData) {
      const { summary, timestamp } = cachedData;
      const now = Date.now();
      
      // If cache is still valid (less than 24 hours old)
      if (now - timestamp < CACHE_DURATION) {
        console.log(`Serving summary for post ${postId} from cache`);
        return res.json({ summary, cached: true });
      } else {
        // Cache expired, remove it
        summaryCache.delete(postId);
      }
    }
    
    // Fetch post data from Hacker News API
    const postResponse = await axios.get(
      `https://hacker-news.firebaseio.com/v0/item/${postId}.json`
    );
    
    const postData = postResponse.data;
    
    if (!postData) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Construct content to summarize (title + text or URL content)
    let contentToSummarize = postData.title;
    if (postData.text) {
      contentToSummarize += '\n' + postData.text;
    }
    
    // Call Groq API for summarization
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, informative summaries.'
          },
          {
            role: 'user',
            content: `Please provide a one-paragraph summary of the following Hacker News post:\n\n${contentToSummarize}`
          }
        ],
        temperature: 0.5,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const summary = groqResponse.data.choices[0].message.content;
    
    // Store in cache with timestamp
    summaryCache.set(postId, {
      summary,
      timestamp: Date.now()
    });
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary', 
      details: error.message 
    });
  }
});

// Cache for comment summaries
const commentSummaryCache = new Map();

// API route for comment summarization
app.post('/api/summarize-comments', async (req, res) => {
  try {
    const { postId } = req.body;
    const MAX_COMMENTS = 10; // Number of top comments to summarize
    
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    // Check if comment summary exists in cache and is not expired
    const cachedData = commentSummaryCache.get(postId);
    if (cachedData) {
      const { summary, timestamp } = cachedData;
      const now = Date.now();
      
      // If cache is still valid (less than 24 hours old)
      if (now - timestamp < CACHE_DURATION) {
        console.log(`Serving comment summary for post ${postId} from cache`);
        return res.json({ summary, cached: true });
      } else {
        // Cache expired, remove it
        commentSummaryCache.delete(postId);
      }
    }
    
    // Fetch post data to get the kids (comments)
    const postResponse = await axios.get(
      `https://hacker-news.firebaseio.com/v0/item/${postId}.json`
    );
    
    const postData = postResponse.data;
    
    if (!postData || !postData.kids || postData.kids.length === 0) {
      return res.status(404).json({ error: 'No comments found for this post' });
    }
    
    // Get the top N comments
    const commentIds = postData.kids.slice(0, MAX_COMMENTS);
    const commentPromises = commentIds.map(commentId => 
      axios.get(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`)
    );
    
    const commentResponses = await Promise.all(commentPromises);
    const comments = commentResponses
      .map(response => response.data)
      .filter(comment => comment && comment.text); // Filter out deleted or null comments
    
    if (comments.length === 0) {
      return res.status(404).json({ error: 'No valid comments found for this post' });
    }
    
    // Concatenate comment texts (with usernames)
    const commentsToSummarize = comments.map(comment => 
      `${comment.by}: ${comment.text.replace(/<[^>]*>/g, '')}` // Strip HTML tags
    ).join('\n\n');
    
    // Call Groq API for comment summarization
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, informative summaries of discussions.'
          },
          {
            role: 'user',
            content: `Please summarize the following Hacker News comments in 2-3 bullet points, capturing the main points and perspectives:\n\n${commentsToSummarize}`
          }
        ],
        temperature: 0.5,
        max_tokens: 250
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const summary = groqResponse.data.choices[0].message.content;
    
    // Store in cache with timestamp
    commentSummaryCache.set(postId, {
      summary,
      timestamp: Date.now()
    });
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});