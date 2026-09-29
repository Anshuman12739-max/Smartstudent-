import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Clock, Calendar as CalendarIcon, BookOpen, AlertCircle, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const Exams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    exam_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    exam_type: 'Midterm',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    const { data, err } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', user.id)
      .order('exam_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (err) {
      setError('Failed to fetch exams: ' + err.message);
    } else if (data) {
      setExams(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (exam = null) => {
    setError('');
    if (exam) {
      setEditingId(exam.id);
      setFormData({
        name: exam.name,
        subject: exam.subject,
        exam_date: exam.exam_date,
        start_time: exam.start_time.substring(0, 5),
        exam_type: exam.exam_type,
        notes: exam.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        subject: '',
        exam_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        exam_type: 'Midterm',
        notes: ''
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
          .from('exams')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', user.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('exams')
          .insert([payload]);
        if (insertErr) throw insertErr;
      }
      
      await fetchExams();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save exam: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const { error: deleteErr } = await supabase
        .from('exams')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (deleteErr) {
        setError('Failed to delete exam: ' + deleteErr.message);
      } else {
        fetchExams();
      }
    }
  };

  const getDaysRemaining = (examDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr + 'T00:00:00'); // Force local
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Group exams
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  const pastExams = exams.filter(e => e.exam_date < todayStr);
  const todayExams = exams.filter(e => e.exam_date === todayStr);
  const upcomingExams = exams.filter(e => e.exam_date > todayStr);

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-md animate-fade-in" style={{background: 'var(--bg-dark)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>{editingId ? 'Edit Exam' : 'Add Exam'}</h3>
          <button onClick={handleCloseModal} className="btn-icon" disabled={submitting}><X size={20} /></button>
        </div>
        
        {error && (
          <div className="badge badge-danger mb-4 flex items-center gap-2" style={{display: 'flex', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Exam Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Calculus Midterm 1" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Subject *</label>
            <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 rounded-lg" placeholder="e.g. Mathematics" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Date *</label>
              <input required type="date" value={formData.exam_date} onChange={e => setFormData({...formData, exam_date: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Start Time *</label>
              <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Exam Type</label>
            <select value={formData.exam_type} onChange={e => setFormData({...formData, exam_type: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}}>
              <option value="Midterm" style={{color: 'black'}}>Midterm</option>
              <option value="Final" style={{color: 'black'}}>Final</option>
              <option value="Quiz" style={{color: 'black'}}>Quiz</option>
              <option value="Practical" style={{color: 'black'}}>Practical</option>
              <option value="Other" style={{color: 'black'}}>Other</option>
            </select>
          </div>
          <div>
             <label className="text-sm text-muted mb-1 block">Notes (Location, chapters, etc.)</label>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem', resize: 'vertical'}} />
          </div>
          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting} style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{padding: '0.75rem', flex: 1, opacity: submitting ? 0.7 : 1}}>{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Exam')}</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderExamCard = (exam, isPast = false) => {
    const daysRemaining = getDaysRemaining(exam.exam_date);
    
    return (
      <div key={exam.id} className="glass p-5 hover-card mb-4" style={{padding: '1.25rem', opacity: isPast ? 0.6 : 1, borderLeft: !isPast && daysRemaining <= 7 ? '4px solid var(--accent-danger)' : 'none'}}>
        <div className="flex justify-between items-start" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div style={{flex: 1}}>
            <div className="flex items-center gap-3 mb-1" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
              <h4 className="m-0" style={{margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '1.2rem'}}>
                {exam.name}
              </h4>
              <span className="badge badge-primary" style={{fontSize: '0.7rem', padding: '0.15rem 0.5rem'}}>{exam.exam_type}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted mb-2 flex-wrap" style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginBottom: '0.5rem'}}>
              <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <BookOpen size={14} /> {exam.subject}
              </span>
              <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: !isPast && daysRemaining <= 3 ? 'var(--accent-danger)' : 'inherit'}}>
                <CalendarIcon size={14} /> {formatDisplayDate(exam.exam_date)}
              </span>
              <span className="flex items-center gap-1" style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <Clock size={14} /> {exam.start_time.substring(0, 5)}
              </span>
            </div>

            {exam.notes && (
              <p className="text-sm mt-2" style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0 0 0'}}>{exam.notes}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-3" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', marginLeft: '1rem'}}>
            {!isPast && (
               <div className="flex flex-col items-center justify-center p-2 rounded-lg" style={{background: daysRemaining <= 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', minWidth: '60px', textAlign: 'center'}}>
                 <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: daysRemaining <= 3 ? 'var(--accent-danger)' : 'var(--text-main)', lineHeight: '1'}}>{daysRemaining === 0 ? 'Tdy' : daysRemaining}</span>
                 <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>{daysRemaining === 0 ? '' : (daysRemaining === 1 ? 'day' : 'days')}</span>
               </div>
            )}
            
            <div className="flex gap-1" style={{display: 'flex', gap: '0.25rem', marginTop: isPast ? '0' : '0.25rem'}}>
              <button onClick={() => handleOpenModal(exam)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-secondary)'}}><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(exam.id)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-danger)'}}><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && exams.length === 0) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Exams...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem', maxWidth: '900px', margin: '0 auto'}}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Your <span className="text-gradient">Exams</span> 🎓</h1>
          <p className="text-muted" style={{margin: 0}}>Prepare for your upcoming midterms and finals.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Exam
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="badge badge-danger mb-6 flex items-center gap-2" style={{display: 'flex', padding: '1rem', borderRadius: '8px', textTransform: 'none', fontSize: '1rem'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {exams.length === 0 ? (
        <div className="glass p-8 text-center mt-8" style={{padding: '4rem', textAlign: 'center'}}>
          <GraduationCap size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
          <h3 className="mb-2">No exams scheduled</h3>
          <p className="text-muted mb-6">You're all clear! Add exams here to track how many days are left to study.</p>
          <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add First Exam
          </button>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          
          {/* Today Section */}
          {todayExams.length > 0 && (
            <div>
              <h3 className="mb-4 text-gradient" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)'}}>
                <AlertTriangle size={20} /> EXAM DAY!
              </h3>
              <div>
                {todayExams.map(e => renderExamCard(e, false))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingExams.length > 0 && (
            <div style={{marginTop: todayExams.length > 0 ? '1rem' : '0'}}>
              <h3 className="mb-4 text-muted" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)'}}>
                <CalendarIcon size={20} /> Upcoming Exams
              </h3>
              <div>
                {upcomingExams.map(e => renderExamCard(e, false))}
              </div>
            </div>
          )}

          {/* Past Section */}
          {pastExams.length > 0 && (
            <div style={{marginTop: (todayExams.length > 0 || upcomingExams.length > 0) ? '1rem' : '0'}}>
              <h3 className="mb-4 text-muted" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Clock size={20} /> Past Exams
              </h3>
              <div>
                {pastExams.map(e => renderExamCard(e, true))}
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && renderModal()}
    </div>
  );
};

export default Exams;
