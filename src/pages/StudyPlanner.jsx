import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, Clock, Calendar as CalendarIcon, BookOpen, Flag, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const StudyPlanner = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    study_date: new Date().toISOString().split('T')[0],
    start_time: '15:00',
    duration: 60,
    priority: 'Medium'
  });

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    const { data, err } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('study_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (err) {
      setError('Failed to fetch study plans: ' + err.message);
    } else if (data) {
      setPlans(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (plan = null) => {
    setError('');
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        subject: plan.subject,
        topic: plan.topic,
        study_date: plan.study_date,
        start_time: plan.start_time.substring(0, 5),
        duration: plan.duration,
        priority: plan.priority
      });
    } else {
      setEditingId(null);
      setFormData({
        subject: '',
        topic: '',
        study_date: new Date().toISOString().split('T')[0],
        start_time: '15:00',
        duration: 60,
        priority: 'Medium'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    const payload = { ...formData, user_id: user.id };

    try {
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('study_plans')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', user.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('study_plans')
          .insert([payload]);
        if (insertErr) throw insertErr;
      }
      
      await fetchPlans();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save study plan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      const { error: deleteErr } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (deleteErr) {
        setError('Failed to delete study plan: ' + deleteErr.message);
      } else {
        fetchPlans();
      }
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'badge-danger';
    if (priority === 'Medium') return 'badge-warning';
    return 'badge-success';
  };

  // Group plans into Today, Past, and Upcoming based on local date
  const todayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD in local time
  
  const todayPlans = plans.filter(p => p.study_date === todayStr);
  const upcomingPlans = plans.filter(p => p.study_date > todayStr);

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Force local interpretation
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-md animate-fade-in" style={{background: 'var(--bg-dark)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>{editingId ? 'Edit Session' : 'Plan Study Session'}</h3>
          <button onClick={handleCloseModal} className="btn-icon" disabled={submitting}><X size={20} /></button>
        </div>
        
        {error && (
          <div className="badge badge-danger mb-4 flex items-center gap-2" style={{display: 'flex', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Subject *</label>
            <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Calculus" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Topic / Chapter *</label>
            <input required type="text" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Derivatives" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Date *</label>
              <input required type="date" value={formData.study_date} onChange={e => setFormData({...formData, study_date: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Start Time *</label>
              <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
          </div>
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Duration (min) *</label>
              <input required type="number" min="15" step="15" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}}>
                <option value="Low" style={{color: 'black'}}>Low</option>
                <option value="Medium" style={{color: 'black'}}>Medium</option>
                <option value="High" style={{color: 'black'}}>High</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting} style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{padding: '0.75rem', flex: 1, opacity: submitting ? 0.7 : 1}}>{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Plan Session')}</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPlanCard = (plan) => (
    <div key={plan.id} className="glass p-5 hover-card mb-4" style={{padding: '1.25rem'}}>
      <div className="flex justify-between items-start" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div>
          <h4 className="m-0 mb-1" style={{margin: 0, marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem'}}>
            {plan.subject}: <span style={{fontWeight: 'normal', color: 'var(--text-muted)'}}>{plan.topic}</span>
          </h4>
          <div className="flex items-center gap-4 text-sm text-muted mb-2 flex-wrap" style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap'}}>
            <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              <CalendarIcon size={14} /> {formatDisplayDate(plan.study_date)}
            </span>
            <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              <Clock size={14} /> {plan.start_time.substring(0, 5)} ({plan.duration} mins)
            </span>
            <span className={`badge ${getPriorityColor(plan.priority)}`} style={{fontSize: '0.7rem'}}>
              {plan.priority} Priority
            </span>
          </div>
        </div>
        
        <div className="flex gap-1" style={{display: 'flex', gap: '0.25rem'}}>
          <button onClick={() => handleOpenModal(plan)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-secondary)'}}><Edit2 size={16} /></button>
          <button onClick={() => handleDelete(plan.id)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-danger)'}}><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );

  if (loading && plans.length === 0) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Study Planner...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem', maxWidth: '900px', margin: '0 auto'}}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Study <span className="text-gradient">Planner</span> 🧠</h1>
          <p className="text-muted" style={{margin: 0}}>Plan your study sessions for optimal retention.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> New Session
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="badge badge-danger mb-6 flex items-center gap-2" style={{display: 'flex', padding: '1rem', borderRadius: '8px', textTransform: 'none', fontSize: '1rem'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="glass p-8 text-center mt-8" style={{padding: '4rem', textAlign: 'center'}}>
          <BrainCircuit size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No study sessions planned</h3>
          <p className="text-muted mb-6">Create a structured plan to stay on top of your coursework.</p>
          <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Plan First Session
          </button>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          {/* Today Section */}
          {todayPlans.length > 0 && (
            <div>
              <h3 className="mb-4 text-gradient" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Flag size={20} /> Today's Focus
              </h3>
              <div>
                {todayPlans.map(renderPlanCard)}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingPlans.length > 0 && (
            <div style={{marginTop: todayPlans.length > 0 ? '1rem' : '0'}}>
              <h3 className="mb-4 text-muted" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <CalendarIcon size={20} /> Upcoming Sessions
              </h3>
              <div>
                {upcomingPlans.map(renderPlanCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && renderModal()}
    </div>
  );
};

export default StudyPlanner;
