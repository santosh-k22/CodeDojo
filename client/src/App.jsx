import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavigationBar from './layouts/NavigationBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import ContestsPage from './pages/ContestsPage';
import ContestCreationForm from './pages/ContestCreationForm';
import ContestDetailPage from './pages/ContestDetailPage';
import Community from './pages/Community';
import BlogDetailPage from './pages/BlogDetailPage';
import FriendsPage from './pages/FriendsPage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:handle" element={<Dashboard />} />
        <Route path="/contests" element={<ContestsPage />} />
        <Route path="/contests/new" element={<ContestCreationForm />} />
        <Route path="/contests/:slug" element={<ContestDetailPage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<BlogDetailPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;