import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpenCheck, 
  Library, 
  BrainCircuit, 
  GraduationCap, 
  LineChart, 
  Sparkles, 
  StickyNote, 
  Target, 
  User 
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/timetable', label: 'Timetable', icon: <CalendarDays size={20} /> },
  { path: '/assignments', label: 'Assignments', icon: <BookOpenCheck size={20} /> },
  { path: '/subjects', label: 'Subjects', icon: <Library size={20} /> },
  { path: '/planner', label: 'Study Planner', icon: <BrainCircuit size={20} /> },
  { path: '/exams', label: 'Exams', icon: <GraduationCap size={20} /> },
  { path: '/progress', label: 'Progress Tracker', icon: <LineChart size={20} /> },
  { path: '/ai-assistant', label: 'AI Assistant', icon: <Sparkles size={20} /> },
  { path: '/notes', label: 'Notes & Resources', icon: <StickyNote size={20} /> },
  { path: '/goals', label: 'Daily Goals', icon: <Target size={20} /> },
  { path: '/profile', label: 'Profile', icon: <User size={20} /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <div className={`sidebar glass ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container flex items-center gap-2">
            <div className="logo-icon bg-gradient">
              <GraduationCap size={24} color="white" />
            </div>
            <h2 className="text-gradient mb-0" style={{ marginBottom: 0 }}>SmartStudent</h2>
          </div>
        </div>
        
        <div className="sidebar-nav-container">
          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => window.innerWidth <= 768 && toggleSidebar()}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="streak-badge glass flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{color: '#f59e0b'}}>🔥</span>
              <span className="font-semibold text-sm">12 Day Streak</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
