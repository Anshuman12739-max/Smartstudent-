import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Target, Plus, CheckCircle, Circle, Trash2, Flame, Trophy, AlertCircle, X, Calendar } from 'lucide-react';

const DailyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error: fetchErr } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchErr) throw fetchErr;
      setGoals(data || []);
    } catch (err) {
      setError('Failed to fetch goals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const payload = { 
        title: formData.title,
        description: formData.description,
        user_id: user.id 
      };

      const { error: insertErr } = await supabase
        .from('daily_goals')
        .insert([payload]);
        
      if (insertErr) throw insertErr;
      
      await fetchGoals();
      setIsModalOpen(false);
      setFormData({ title: '', description: '' });
    } catch (err) {
      setError('Failed to add goal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error: updateErr } = await supabase
        .from('daily_goals')
        .update({ 
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (updateErr) throw updateErr;
      await fetchGoals();
    } catch (err) {
      setError('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const { error: deleteErr } = await supabase
          .from('daily_goals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (deleteErr) throw deleteErr;
        await fetchGoals();
      } catch (err) {
        setError('Failed to delete goal: ' + err.message);
      }
    }
  };

  // Date and Calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Filter today's goals
  const todaysGoals = goals.filter(goal => {
    const goalDate = new Date(goal.created_at);
    goalDate.setHours(0, 0, 0, 0);
    return goalDate.getTime() === today.getTime();
  });

  const completedToday = todaysGoals.filter(g => g.is_completed).length;
  const totalToday = todaysGoals.length;
  const progressPercent = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  // Calculate Streak
  // (Days in a row where at least 1 goal was completed, counting backwards from today or yesterday)
  const calculateStreak = () => {
    if (goals.length === 0) return 0;
    
    // Get unique dates with at least 1 completed goal
    const completedDates = [...new Set(
      goals
        .filter(g => g.is_completed && g.completed_at)
        .map(g => {
          const d = new Date(g.completed_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    )].sort((a, b) => b - a); // Descending

    let currentStreak = 0;
    let checkDate = new Date(today); // Start with today

    // If today is not in completed dates, check if yesterday is.
    // If neither today nor yesterday has a completed goal, streak is 0.
    if (!completedDates.includes(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!completedDates.includes(checkDate.getTime())) {
        return 0;
      }
    }

    // Traverse backwards
    while (completedDates.includes(checkDate.getTime())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return currentStreak;
  };

  const streak = calculateStreak();

  // Motivational Messages
  const getMotivationalMessage = () => {
    if (totalToday === 0) return "Ready to crush the day? Set your first goal!";
    if (progressPercent === 100) return "Incredible! You've completed all your goals today!";
    if (progressPercent >= 50) return "You're halfway there, keep the momentum going!";
    return "Every small step counts. You got this!";
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-md animate-fade-in" style={{background: 'var(--bg-dark)', borderRadius: '16px'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>Add Daily Goal</h3>
          <button onClick={() => setIsModalOpen(false)} className="btn-icon" disabled={submitting}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Goal Title *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Read Chapter 4 of Biology" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Description (Optional)</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Focus on the cell cycle section" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem', minHeight: '100px', resize: 'vertical'}} />
          </div>
          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={submitting} style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{padding: '0.75rem', flex: 1, opacity: submitting ? 0.7 : 1}}>{submitting ? 'Adding...' : 'Add Goal'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading && goals.length === 0) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Goals...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem'}}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Daily <span className="text-gradient">Goals</span> <Target size={28} style={{display: 'inline', verticalAlign: 'text-bottom'}}/></h1>
          <p className="text-muted flex items-center gap-2" style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Calendar size={16} /> {todayString}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Goal
        </button>
      </div>

      {error && (
        <div className="badge badge-danger mb-6 flex items-center gap-2" style={{display: 'flex', padding: '1rem', borderRadius: '8px', textTransform: 'none', fontSize: '1rem'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid-cols-3 mb-8" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
        
        {/* Progress Card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center" style={{padding: '1.5rem', borderRadius: '1rem', textAlign: 'center'}}>
          <div className="mb-2" style={{position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg viewBox="0 0 36 36" style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeDasharray={`${progressPercent}, 100`} style={{transition: 'stroke-dasharray 1s ease'}} />
            </svg>
            <span style={{position: 'absolute', fontWeight: 'bold', fontSize: '1.2rem'}}>{progressPercent}%</span>
          </div>
          <h3 style={{margin: '0.5rem 0 0.25rem 0'}}>Daily Progress</h3>
          <p className="text-muted text-sm" style={{margin: 0}}>{completedToday} of {totalToday} completed</p>
        </div>

        {/* Streak Card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center" style={{padding: '1.5rem', borderRadius: '1rem', textAlign: 'center'}}>
          <div className="mb-3 p-4 rounded-full" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'inline-flex'}}>
            <Flame size={40} />
          </div>
          <h3 style={{margin: '0 0 0.25rem 0'}}>Current Streak</h3>
          <p className="text-muted text-sm" style={{margin: 0}}>{streak} {streak === 1 ? 'Day' : 'Days'} in a row</p>
        </div>

        {/* Motivation Card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center" style={{padding: '1.5rem', borderRadius: '1rem', textAlign: 'center'}}>
          <div className="mb-3 p-4 rounded-full" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'inline-flex'}}>
            <Trophy size={40} />
          </div>
          <h3 style={{margin: '0 0 0.25rem 0'}}>Keep it up!</h3>
          <p className="text-muted text-sm" style={{margin: 0, lineHeight: 1.5}}>{getMotivationalMessage()}</p>
        </div>
      </div>

      {/* Goals List */}
      <h2 className="mb-4">Today's Goals</h2>
      
      {todaysGoals.length === 0 ? (
        <div className="glass p-8 text-center" style={{padding: '4rem', textAlign: 'center'}}>
          <Target size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No goals set for today</h3>
          <p className="text-muted mb-6">Start your day right by setting achievable objectives.</p>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {todaysGoals.map(goal => (
            <div key={goal.id} className="glass p-4 rounded-xl flex items-center gap-4 transition-all hover-card" style={{padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: goal.is_completed ? 0.7 : 1}}>
              
              <button 
                onClick={() => toggleStatus(goal.id, goal.is_completed)} 
                className="btn-icon"
                style={{padding: '0', color: goal.is_completed ? '#10b981' : 'var(--text-muted)'}}
              >
                {goal.is_completed ? <CheckCircle size={28} /> : <Circle size={28} />}
              </button>
              
              <div style={{flex: 1}}>
                <h3 className="m-0" style={{margin: 0, fontSize: '1.1rem', textDecoration: goal.is_completed ? 'line-through' : 'none', color: goal.is_completed ? 'var(--text-muted)' : 'var(--text-main)'}}>
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-muted text-sm mt-1" style={{margin: '0.25rem 0 0 0', textDecoration: goal.is_completed ? 'line-through' : 'none'}}>
                    {goal.description}
                  </p>
                )}
              </div>

              <button 
                onClick={() => handleDelete(goal.id)} 
                className="btn-icon" 
                style={{padding: '0.5rem', color: 'var(--accent-danger)'}} 
                title="Delete Goal"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && renderModal()}
    </div>
  );
};

export default DailyGoals;
