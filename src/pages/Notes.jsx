import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { StickyNote, Plus, Edit2, Trash2, X, AlertCircle, Search, Filter, Tag, Library, Clock } from 'lucide-react';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject_id: '',
    tags: '' // Will be converted to/from array
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch subjects for dropdowns
      const { data: subjectsData, error: subjectsErr } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
        
      if (subjectsErr) throw subjectsErr;
      setSubjects(subjectsData || []);

      // Fetch notes
      const { data: notesData, error: notesErr } = await supabase
        .from('notes')
        .select('*, subjects(name)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (notesErr) throw notesErr;
      setNotes(notesData || []);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (note = null) => {
    setError('');
    if (note) {
      setEditingId(note.id);
      setFormData({
        title: note.title,
        content: note.content || '',
        subject_id: note.subject_id || '',
        tags: (note.tags || []).join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        subject_id: '',
        tags: ''
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
    
    // Process tags
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = { 
      title: formData.title,
      content: formData.content,
      subject_id: formData.subject_id || null,
      tags: tagsArray,
      user_id: user.id 
    };

    try {
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('notes')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', user.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('notes')
          .insert([payload]);
        if (insertErr) throw insertErr;
      }
      
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save note: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setLoading(true);
      const { error: deleteErr } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (deleteErr) {
        setError('Failed to delete note: ' + deleteErr.message);
        setLoading(false);
      } else {
        await fetchData();
      }
    }
  };

  // Filter notes based on search and subject
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesSubject = subjectFilter === '' || note.subject_id === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-2xl animate-fade-in flex flex-col" style={{background: 'var(--bg-dark)', borderRadius: '16px', maxHeight: '90vh'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>{editingId ? 'Edit Note' : 'Add Note'}</h3>
          <button onClick={handleCloseModal} className="btn-icon" disabled={submitting}><X size={20} /></button>
        </div>
        
        {error && (
          <div className="badge badge-danger mb-4 flex items-center gap-2" style={{display: 'flex', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto" style={{display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, paddingRight: '0.5rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Title *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Chapter 1: Introduction to Algorithms" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <div className="w-full" style={{flex: '1 1 200px'}}>
              <label className="text-sm text-muted mb-1 block">Subject</label>
              <select 
                value={formData.subject_id} 
                onChange={e => setFormData({...formData, subject_id: e.target.value})} 
                className="w-full p-2 rounded-lg" 
                style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}}
              >
                <option value="" style={{background: 'var(--bg-dark)'}}>None / General</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id} style={{background: 'var(--bg-dark)'}}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full" style={{flex: '2 1 300px'}}>
              <label className="text-sm text-muted mb-1 block">Tags (comma separated)</label>
              <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. algorithms, midterm, important" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
          </div>

          <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <label className="text-sm text-muted mb-1 block">Content</label>
            <textarea 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              className="w-full p-2 rounded-lg" 
              placeholder="Write your notes here..." 
              style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem', flex: 1, minHeight: '200px', resize: 'vertical'}} 
            />
          </div>

          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting} style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{padding: '0.75rem', flex: 1, opacity: submitting ? 0.7 : 1}}>{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Note')}</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading && notes.length === 0) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Notes...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem'}}>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Notes & <span className="text-gradient">Resources</span> 📓</h1>
          <p className="text-muted" style={{margin: 0}}>Your centralized hub for class notes and study materials.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Note
        </button>
      </div>

      <div className="glass p-4 mb-8 flex gap-4 flex-wrap" style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
        <div className="flex-1 min-w-[250px]" style={{flex: '1 1 250px', position: 'relative'}}>
          <Search size={18} className="text-muted" style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)'}} />
          <input 
            type="text" 
            placeholder="Search notes, content, or tags..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg" 
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem 0.75rem 2.5rem'}}
          />
        </div>
        <div className="min-w-[200px]" style={{flex: '0 1 250px', position: 'relative'}}>
          <Filter size={18} className="text-muted" style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)'}} />
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg" 
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem 0.75rem 2.5rem', appearance: 'none'}}
          >
            <option value="" style={{background: 'var(--bg-dark)'}}>All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id} style={{background: 'var(--bg-dark)'}}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="badge badge-danger mb-6 flex items-center gap-2" style={{display: 'flex', padding: '1rem', borderRadius: '8px', textTransform: 'none', fontSize: '1rem'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {notes.length === 0 && searchTerm === '' && subjectFilter === '' ? (
        <div className="glass p-8 text-center mt-4" style={{padding: '4rem', textAlign: 'center'}}>
          <StickyNote size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No notes yet</h3>
          <p className="text-muted mb-6">Start documenting your learning journey by creating your first note.</p>
          <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Create First Note
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="glass p-8 text-center mt-4" style={{padding: '3rem', textAlign: 'center'}}>
          <Search size={32} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No results found</h3>
          <p className="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
          <button className="btn btn-secondary mt-4" onClick={() => { setSearchTerm(''); setSubjectFilter(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid-cols-3" style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {filteredNotes.map(note => (
            <div key={note.id} className="glass p-6 hover-card flex flex-col" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '220px'}}>
              <div className="flex justify-between items-start mb-3" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem'}}>
                <div style={{flex: 1, paddingRight: '1rem'}}>
                  <h3 className="m-0" style={{margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-main)', fontSize: '1.15rem', lineHeight: 1.3}}>
                    {note.title}
                  </h3>
                  {note.subjects && (
                    <div className="badge" style={{background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', padding: '0.2rem 0.5rem'}}>
                      <Library size={10} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}}/>
                      {note.subjects.name}
                    </div>
                  )}
                </div>
                <div className="flex gap-1" style={{display: 'flex', gap: '0.25rem', flexShrink: 0}}>
                  <button onClick={() => handleOpenModal(note)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-secondary)'}} title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(note.id)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-danger)'}} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="text-muted text-sm mb-4" style={{
                flex: 1, 
                overflow: 'hidden', 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.5,
                marginBottom: '1rem'
              }}>
                {note.content || <span style={{fontStyle: 'italic', opacity: 0.5}}>No content</span>}
              </div>
              
              <div className="mt-auto pt-3 flex flex-col gap-3" style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2" style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                    {note.tags.map((tag, i) => (
                      <span key={i} className="badge" style={{background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center text-xs text-muted" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7}}>
                  <Clock size={12} /> Last updated: {formatDate(note.updated_at)}
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

export default Notes;
