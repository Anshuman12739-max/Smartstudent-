import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Library, User, BookOpen, Layers, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    course: '',
    credits: 3
  });

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    const { data, err } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (err) {
      setError('Failed to fetch subjects: ' + err.message);
    } else if (data) {
      setSubjects(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (subject = null) => {
    setError('');
    if (subject) {
      setEditingId(subject.id);
      setFormData({
        name: subject.name,
        teacher: subject.teacher || '',
        course: subject.course || '',
        credits: subject.credits || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        teacher: '',
        course: '',
        credits: 3
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
          .from('subjects')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', user.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('subjects')
          .insert([payload]);
        if (insertErr) throw insertErr;
      }
      
      await fetchSubjects();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save subject: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setLoading(true);
      const { error: deleteErr } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (deleteErr) {
        setError('Failed to delete subject: ' + deleteErr.message);
        setLoading(false);
      } else {
        await fetchSubjects();
      }
    }
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-md animate-fade-in" style={{background: 'var(--bg-dark)', borderRadius: '16px'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>{editingId ? 'Edit Subject' : 'Add Subject'}</h3>
          <button onClick={handleCloseModal} className="btn-icon" disabled={submitting}><X size={20} /></button>
        </div>
        
        {error && (
          <div className="badge badge-danger mb-4 flex items-center gap-2" style={{display: 'flex', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Subject Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Data Structures" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Teacher / Professor</label>
            <input type="text" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Dr. Smith" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <div className="w-full" style={{flex: 2}}>
              <label className="text-sm text-muted mb-1 block">Course / Semester</label>
              <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Fall 2026" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Credits</label>
              <input type="number" min="0" step="0.5" value={formData.credits} onChange={e => setFormData({...formData, credits: parseFloat(e.target.value) || 0})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
          </div>
          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting} style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{padding: '0.75rem', flex: 1, opacity: submitting ? 0.7 : 1}}>{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Subject')}</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading && subjects.length === 0) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Subjects...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem'}}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Your <span className="text-gradient">Subjects</span> 📚</h1>
          <p className="text-muted" style={{margin: 0}}>Organize your study materials by course or subject.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="badge badge-danger mb-6 flex items-center gap-2" style={{display: 'flex', padding: '1rem', borderRadius: '8px', textTransform: 'none', fontSize: '1rem'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="glass p-8 text-center mt-8" style={{padding: '4rem', textAlign: 'center'}}>
          <Library size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No subjects added</h3>
          <p className="text-muted mb-6">Start building your academic portfolio by adding your enrolled courses.</p>
          <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid-cols-3" style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {subjects.map(subject => (
            <div key={subject.id} className="glass p-6 hover-card flex flex-col" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%'}}>
              <div className="flex justify-between items-start mb-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                <div className="p-3 rounded-xl" style={{background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)'}}>
                  <BookOpen size={24} />
                </div>
                <div className="flex gap-1" style={{display: 'flex', gap: '0.25rem'}}>
                  <button onClick={() => handleOpenModal(subject)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-secondary)'}}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(subject.id)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-danger)'}}><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="mb-2 m-0" style={{margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-main)', fontSize: '1.25rem'}}>
                {subject.name}
              </h3>
              
              <div className="flex flex-col gap-2 mt-auto pt-4" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                {subject.teacher && (
                  <div className="flex items-center gap-2 text-sm text-muted" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)'}}>
                    <User size={16} /> <span>{subject.teacher}</span>
                  </div>
                )}
                {subject.course && (
                  <div className="flex items-center gap-2 text-sm text-muted" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)'}}>
                    <Layers size={16} /> <span>{subject.course}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem'}}>
                   <span className="badge badge-primary">{subject.credits} Credits</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && renderModal()}
    </div>
  );
};

export default Subjects;
