import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage'; // Ensure LoginPage is imported
import AskHNPage from './pages/AskHNPage'; // Import AskHNPage
import ShowHNPage from './pages/ShowHNPage'; // Import ShowHNPage
import JobsPage from './pages/JobsPage';   // Import JobsPage
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div style={{ maxWidth: '85%', margin: '0 auto', backgroundColor: '#f6f6ef', padding: '8px 0' }}> {/* Added top/bottom padding */}
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
        {/* Ensure the login route is present */}
        <Route path="/login" element={<LoginPage />} /> 
        {/* Add routes for Ask, Show, and Jobs pages */}
        <Route path="/ask" element={<AskHNPage />} />
        <Route path="/show" element={<ShowHNPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;