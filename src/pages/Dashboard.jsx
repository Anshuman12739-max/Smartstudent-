import React from 'react';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { profile } = useAuth();
  
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Student';

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2">Welcome back, <span className="text-gradient">{firstName}!</span> 👋</h1>
          <p>You have 0 assignments due this week and 0 classes today.</p>
        </div>
        <button className="btn btn-primary" style={{opacity: 0.7, cursor: 'not-allowed'}}>
          <Sparkles size={18} />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-cols-4 mb-8">
        <div className="glass hover-card p-6" style={{padding: '1.5rem'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)'}}>
              <BookOpen size={24} />
            </div>
            <div>
              <p className="mb-0 text-sm">Study Hours</p>
              <h2 className="mb-0" style={{marginBottom: 0}}>0h</h2>
            </div>
          </div>
          <div className="text-sm text-muted">No data for this week</div>
        </div>

        <div className="glass hover-card p-6" style={{padding: '1.5rem'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-secondary)'}}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="mb-0 text-sm">Current GPA</p>
              <h2 className="mb-0" style={{marginBottom: 0}}>--</h2>
            </div>
          </div>
          <div className="text-sm text-muted">Add courses to calculate</div>
        </div>

        <div className="glass hover-card p-6" style={{padding: '1.5rem'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)'}}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="mb-0 text-sm">Tasks Done</p>
              <h2 className="mb-0" style={{marginBottom: 0}}>0</h2>
            </div>
          </div>
          <div className="text-sm text-muted">0 tasks remaining</div>
        </div>

        <div className="glass hover-card p-6" style={{padding: '1.5rem'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)'}}>
              <Clock size={24} />
            </div>
            <div>
              <p className="mb-0 text-sm">Next Class</p>
              <h2 className="mb-0" style={{marginBottom: 0}}>--:--</h2>
            </div>
          </div>
          <div className="text-sm text-muted">No classes scheduled</div>
        </div>
      </div>

      <div className="grid-cols-3">
        {/* Main Content Area - Takes up 2 columns */}
        <div className="col-span-2" style={{gridColumn: 'span 2 / span 2'}}>
          
          <div className="glass p-6 mb-6" style={{padding: '1.5rem'}}>
            <div className="flex justify-between items-center mb-6">
              <h3>Upcoming Assignments</h3>
              <button className="btn-icon"><ChevronRight size={20} /></button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-8 text-center border-dashed rounded-xl" style={{border: '2px dashed rgba(255,255,255,0.1)', margin: '1rem 0'}}>
              <div className="p-4 rounded-full mb-4" style={{background: 'rgba(255,255,255,0.05)'}}>
                <BookOpen size={32} className="text-muted" />
              </div>
              <h4 className="mb-2">No assignments yet</h4>
              <p className="text-muted mb-4">Keep track of your homework, projects, and deadlines.</p>
              <button className="btn btn-secondary text-sm"><Plus size={16} /> Add your first task</button>
            </div>
          </div>

          <div className="glass p-6" style={{padding: '1.5rem'}}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-gradient" size={24} />
              <h3>AI Study Recommendations</h3>
            </div>
            <div className="p-4 rounded-xl flex items-center gap-4" style={{background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed rgba(139, 92, 246, 0.3)'}}>
              <div className="text-muted">
                <p style={{marginBottom: '0'}}>No study data available yet. Start tracking your subjects and assignments to get personalized AI tips and review sessions.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar area - Takes up 1 column */}
        <div className="flex flex-col gap-6" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="glass p-6" style={{padding: '1.5rem', height: '100%'}}>
            <div className="flex justify-between items-center mb-6">
              <h3>Today's Schedule</h3>
              <CalendarIcon size={20} className="text-muted" />
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
               <CalendarIcon size={40} className="text-muted mb-4" style={{opacity: 0.5}} />
               <p className="text-muted">No classes scheduled for today. Take a breather or add a study session!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
