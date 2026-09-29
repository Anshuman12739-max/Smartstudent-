import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Clock, MapPin, User, Plus, Edit2, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room: ''
  });

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
    } else {
      setClasses(data);
    }
    setLoading(false);
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingId(cls.id);
      setFormData({
        subject: cls.subject,
        teacher: cls.teacher || '',
        day: cls.day,
        start_time: cls.start_time.substring(0,5),
        end_time: cls.end_time.substring(0,5),
        room: cls.room || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        subject: '',
        teacher: '',
        day: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        room: ''
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
    if (editingId) {
      const { error } = await supabase
        .from('timetable')
        .update(formData)
        .eq('id', editingId)
        .eq('user_id', user.id);
      
      if (!error) fetchClasses();
    } else {
      const { error } = await supabase
        .from('timetable')
        .insert([{ ...formData, user_id: user.id }]);
      
      if (!error) fetchClasses();
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (!error) fetchClasses();
    }
  };

  const groupedClasses = DAYS.reduce((acc, day) => {
    acc[day] = classes.filter(c => c.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top:0, left:0, right:0, bottom:0}}>
      <div className="glass p-6 w-full max-w-md animate-fade-in" style={{background: 'var(--bg-dark)', borderRadius: '16px'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0" style={{margin: 0}}>{editingId ? 'Edit Class' : 'Add New Class'}</h3>
          <button onClick={handleCloseModal} className="btn-icon"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <label className="text-sm text-muted mb-1 block">Subject *</label>
            <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Day *</label>
            <select required value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}}>
              {DAYS.map(d => <option key={d} value={d} style={{color: 'black'}}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">Start Time *</label>
              <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
            <div className="w-full" style={{flex: 1}}>
              <label className="text-sm text-muted mb-1 block">End Time *</label>
              <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Room / Location</label>
            <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Teacher</label>
            <input type="text" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} className="w-full p-2 rounded-lg" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.75rem'}} />
          </div>
          <div className="mt-4 flex gap-4" style={{display: 'flex', gap: '1rem'}}>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary" style={{padding: '0.75rem', flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{padding: '0.75rem', flex: 1}}>{editingId ? 'Save Changes' : 'Add Class'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Loading Timetable...</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem'}}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Your <span className="text-gradient">Timetable</span> 📅</h1>
          <p className="text-muted" style={{margin: 0}}>Manage your weekly classes and recurring events.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Class
        </button>
      </div>

      <div className="timetable-grid" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {DAYS.map(day => (
          <div key={day} className="glass p-5 hover-card" style={{padding: '1.25rem', display: groupedClasses[day].length > 0 ? 'block' : 'none'}}>
            <h3 className="mb-4 text-gradient border-b pb-2" style={{borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginTop: 0}}>{day}</h3>
            
            <div className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {groupedClasses[day].map(cls => (
                <div key={cls.id} className="p-4 rounded-xl" style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem'}}>
                  <div className="flex justify-between items-start mb-2" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                    <h4 className="m-0" style={{margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem'}}>{cls.subject}</h4>
                    <div className="flex gap-2" style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenModal(cls)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-secondary)'}}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(cls.id)} className="btn-icon" style={{padding: '0.25rem', color: 'var(--accent-danger)'}}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-sm text-muted" style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                    <div className="flex items-center gap-2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <Clock size={14} /> {cls.start_time.substring(0,5)} - {cls.end_time.substring(0,5)}
                    </div>
                    {cls.room && (
                      <div className="flex items-center gap-2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <MapPin size={14} /> {cls.room}
                      </div>
                    )}
                    {cls.teacher && (
                      <div className="flex items-center gap-2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <User size={14} /> {cls.teacher}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {classes.length === 0 && (
          <div className="col-span-full glass p-8 text-center" style={{gridColumn: '1 / -1', padding: '3rem', textAlign: 'center'}}>
            <CalendarIcon size={48} className="text-muted" style={{opacity: 0.5, margin: '0 auto 1rem auto', display: 'block'}} />
            <h3 className="mb-2">Your timetable is empty</h3>
            <p className="text-muted mb-6">Add your classes to keep track of your weekly schedule.</p>
            <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
              <Plus size={18} /> Create First Class
            </button>
          </div>
        )}
      </div>

      {isModalOpen && renderModal()}
    </div>
  );
};

export default Timetable;
