import React from 'react';
import { Menu, Search, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, profile } = useAuth();
  
  const email = user?.email || 'Student';
  const name = profile?.full_name || email;
  const course = profile?.course || 'Student';
  const initial = name !== 'Student' ? name.charAt(0).toUpperCase() : 'U';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="header glass">
      <div className="header-left">
        <button className="btn-icon mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar glass">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search tasks, notes, subjects..." className="search-input" />
        </div>
      </div>
      
      <div className="header-right">
        <button className="btn-icon">
          <div className="notification-badge" style={{display: 'none'}}></div>
          <Bell size={20} />
        </button>
        <button className="btn-icon">
          <Settings size={20} />
        </button>
        <div className="user-profile">
          <div className="avatar bg-gradient">
            <span style={{color: 'white', fontWeight: 'bold'}}>{initial}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{name}</span>
            <span className="user-role">{course}</span>
          </div>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Sign Out" style={{marginLeft: '0.5rem', color: 'var(--accent-danger)'}}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
