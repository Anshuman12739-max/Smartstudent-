import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenCheck, Calendar, Flag, Plus, Edit2, Trash2, X, CheckCircle2, Circle } from 'lucide-react';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    status: 'Pending'
  });

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (!error && data) {
      setAssignments(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (assignment = null) => {
    if (assignment) {
      setEditingId(assignment.id);
      setFormData({
        title: assignment.title,
        subject: assignment.subject,
        description: assignment.description || '',
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
        priority: assignment.priority,
        status: assignment.status
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        subject: '',
        description: '',
        due_date: '',
        priority: 'Medium',
        status: 'Pending'
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
    const payload = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      user_id: user.id
    };

    if (editingId) {
      await supabase.from('assignments').update(payload).eq('id', editingId).eq('user_id', user.id);
    } else {
      await supabase.from('assignments').insert([payload]);
    }
    fetchAssignments();
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      await supabase.from('assignments').delete().eq('id', id).eq('user_id', user.id);
      fetchAssignments();
    }
  };

  const toggleStatus = async (assignment) => {
    const newStatus = assignment.status === 'Completed' ? 'Pending' : 'Completed';
    
    // Optimistic UI update
    setAssignments(assignments.map(a => a.id === assignment.id ? { ...a, status: newStatus } : a));
    
    await supabase.from('assignments').update({ status: newStatus }).eq('id', assignment.id).eq('user_id', user.id);
    // Silent refetch to ensure sync
    const { data } = await supabase.from('assignments').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
    if (data) setAssignments(data);
  };

  const pendingAssignments = assignments.filter(a => a.status !== 'Completed');
  const completedAssignments = assignments.filter(a => a.status === 'Completed');

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'badge-danger';
    if (priority === 'Medium') return 'badge-warning';
    return 'badge-success';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-md animate-fade-in" style={{background: 'var(--bg-dark)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>{editingId ? 'Edit Assignment' : 'Add Assignment'}</h3>
          <button onClick={handleCloseModal} className="btn-icon"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Title *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Subject *</label>
            <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Due Date & Time</label>
            <input type="datetime-local" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}}>
                <option value="Low" style={{color: 'black'}}>Low</option>
                <option value="Medium" style={{color: 'black'}}>Medium</option>
                <option value="High" style={{color: 'black'}}>High</option>
              </select>
            </div>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}}>
                <option value="Pending" style={{color: 'black'}}>Pending</option>
                <option value="Completed" style={{color: 'black'}}>Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem', resize: 'vertical'}} />
          </div>
          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary" style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{padding: '0.75rem', flex: 1}}>{editingId ? 'Save Changes' : 'Add Assignment'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAssignmentCard = (assignment) => (
    <div key={assignment.id} className="glass p-5 hover-card mb-4" style={{padding: '1.25rem', transition: 'all 0.3s', opacity: assignment.status === 'Completed' ? 0.7 : 1}}>
      <div className="flex justify-between items-start" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div className="flex items-start gap-4" style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
          <button onClick={() => toggleStatus(assignment)} className="btn-icon" style={{padding: '0.25rem', marginTop: '0.1rem', color: assignment.status === 'Completed' ? 'var(--accent-success)' : 'var(--text-muted)'}}>
            {assignment.status === 'Completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
          <div>
            <h4 className="m-0 mb-1" style={{margin: 0, marginBottom: '0.25rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem', textDecoration: assignment.status === 'Completed' ? 'line-through' : 'none'}}>
              {assignment.title}
            </h4>
            <div className="flex items-center gap-3 text-sm text-muted mb-2" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', flexWrap: 'wrap'}}>
              <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <BookOpenCheck size={14} /> {assignment.subject}
              </span>
              <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.status !== 'Completed' ? 'var(--accent-danger)' : 'inherit'}}>
                <Calendar size={14} /> {formatDate(assignment.due_date)}
              </span>
            </div>
            {assignment.description && (
              <p className="text-sm mt-2" style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 0}}>{assignment.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem'}}>
          <span className={`badge ${getPriorityColor(assignment.priority)}`}>
            {assignment.priority}
          </span>
          <div className="flex gap-1" style={{display: 'flex', gap: '0.25rem'}}>
            <button onClick={() => handleOpenModal(assignment)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-secondary)'}}><Edit2 size={16} /></button>
            <button onClick={() => handleDelete(assignment.id)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-danger)'}}><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Assignments...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem', maxWidth: '900px', margin: '0 auto'}}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Your <span className="text-gradient">Assignments</span> 📝</h1>
          <p className="text-muted" style={{margin: 0}}>Keep track of your homework, projects, and deadlines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="glass p-8 text-center mt-8" style={{padding: '4rem', textAlign: 'center'}}>
          <BookOpenCheck size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No assignments yet</h3>
          <p className="text-muted mb-6">You're all caught up! Add a new task when you get homework.</p>
          <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Create Assignment
          </button>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          {/* Pending Section */}
          {pendingAssignments.length > 0 && (
            <div>
              <h3 className="mb-4 text-gradient" style={{marginBottom: '1rem'}}>Pending ({pendingAssignments.length})</h3>
              <div>
                {pendingAssignments.map(renderAssignmentCard)}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completedAssignments.length > 0 && (
            <div style={{marginTop: pendingAssignments.length > 0 ? '1rem' : '0'}}>
              <h3 className="mb-4 text-muted" style={{marginBottom: '1rem'}}>Completed ({completedAssignments.length})</h3>
              <div>
                {completedAssignments.map(renderAssignmentCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && renderModal()}
    </div>
  );
};

export default Assignments;
