# Hacker News Clone with AI Summarizer

This project is a Hacker News clone built with React, TypeScript, and Tailwind CSS. It includes an AI Summarizer feature that uses the Groq LLM API to generate concise summaries of Hacker News posts.

## Features

- Browse top stories, Ask HN, Show HN, and job listings
- View post details and comments
- AI-powered post summarization
- Responsive design with Tailwind CSS

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Groq API key (sign up at https://console.groq.com)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Rename `.env` to `.env.local` if needed
   - Add your Groq API key to the `.env` file:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     PORT=3001
     ```

### Running the Application

To run both the frontend and backend concurrently:

```
npm run dev:all
```

Or run them separately:

- Frontend: `npm run dev`
- Backend: `npm run server`

The application will be available at http://localhost:5173 (or the port specified by Vite).

## Using the AI Summarizer

1. Navigate to any post detail page
2. Click the "Show AI Summary" button below the post content
3. Wait for the summary to be generated
4. The summary will appear in a box below the button

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Express.js
- Groq LLM API (llama3-8b-8192 model)
- Axios for API requests

## Project Structure

- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/pages` - Page components
  - `/api` - API utility functions
  - `/types` - TypeScript interfaces
  - `/utils` - Utility functions
- `/server` - Express.js backend
  - `server.js` - API endpoints for AI summarization
- `/public` - Static assets