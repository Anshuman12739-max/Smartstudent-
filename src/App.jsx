import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import { useAuth } from './contexts/AuthContext';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Subjects from './pages/Subjects';
import StudyPlanner from './pages/StudyPlanner';
import Exams from './pages/Exams';
import ProgressTracker from './pages/ProgressTracker';
import AIStudyAssistant from './pages/AIStudyAssistant';
import Notes from './pages/Notes';
import DailyGoals from './pages/DailyGoals';
import Profile from './pages/Profile';

function App() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen" style={{background: 'var(--bg-dark)'}}>
        <div className="text-gradient" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Loading SmartStudent...</div>
      </div>
    );
  }

  // Force profile setup if missing
  const requireProfile = (element) => {
    if (!session) return <Navigate to="/login" replace />;
    if (!profile) return <ProfileSetup />;
    return element;
  };

  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected layout routes */}
        <Route path="/" element={requireProfile(<Layout />)}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="planner" element={<StudyPlanner />} />
          <Route path="exams" element={<Exams />} />
          <Route path="progress" element={<ProgressTracker />} />
          <Route path="ai-assistant" element={<AIStudyAssistant />} />
          <Route path="notes" element={<Notes />} />
          <Route path="goals" element={<DailyGoals />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
