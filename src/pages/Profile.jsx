import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { User, Mail, Book, GraduationCap, Edit2, LogOut, Check, X, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    course: profile?.course || '',
    college: profile?.college || ''
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Auth context will catch the state change and redirect to login
    } catch (err) {
      console.error('Error logging out:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    const { error } = await updateProfile(formData);
    
    if (error) {
      setMessage({ text: 'Failed to update profile: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    }
    setLoading(false);
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto'}}>
      
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="mb-2">Student <span className="text-gradient">Profile</span> <User size={28} style={{display: 'inline', verticalAlign: 'text-bottom'}}/></h1>
          <p className="text-muted" style={{margin: 0}}>Manage your personal information and preferences.</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2" onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,100,100,0.3)', color: '#ff8a8a'}}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {message.text && (
        <div className={`badge mb-6 flex items-center gap-2 ${message.type === 'error' ? 'badge-danger' : 'badge-primary'}`} style={{display: 'flex', padding: '1rem', borderRadius: '8px', textTransform: 'none', fontSize: '1rem', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? '#ef4444' : '#10b981'}}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />} {message.text}
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden mb-8" style={{borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)'}}>
        
        {/* Profile Header Background */}
        <div style={{height: '120px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)', position: 'relative'}}>
          
          {/* Avatar */}
          <div style={{
            position: 'absolute', 
            bottom: '-40px', 
            left: '2rem',
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            border: '4px solid var(--bg-dark)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
            {getInitials(profile?.full_name)}
          </div>
        </div>

        {/* Profile Content */}
        <div style={{padding: '3rem 2rem 2rem 2rem'}}>
          
          <div className="flex justify-between items-start mb-6" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <h2 className="m-0" style={{margin: 0, fontSize: '1.8rem'}}>{profile?.full_name || 'Student Name'}</h2>
              <p className="text-muted" style={{margin: '0.25rem 0 0 0'}}>{user?.email}</p>
            </div>
            
            {!isEditing && (
              <button className="btn-icon" onClick={() => {
                setFormData({
                  full_name: profile?.full_name || '',
                  course: profile?.course || '',
                  college: profile?.college || ''
                });
                setIsEditing(true);
              }} style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" style={{display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem'}}>
              
              <div className="grid-cols-2" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem'}}>
                <div>
                  <label className="text-sm text-muted mb-1 block">Full Name</label>
                  <div style={{position: 'relative'}}>
                    <User size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}} />
                    <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-2 pl-10 rounded-lg" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem 0.75rem 2.5rem'}} />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted mb-1 block">Email (Read-only)</label>
                  <div style={{position: 'relative'}}>
                    <Mail size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}} />
                    <input type="email" disabled value={user?.email || ''} className="w-full p-2 pl-10 rounded-lg" style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '0.75rem 1rem 0.75rem 2.5rem', cursor: 'not-allowed'}} />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted mb-1 block">Course / Program</label>
                  <div style={{position: 'relative'}}>
                    <Book size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}} />
                    <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full p-2 pl-10 rounded-lg" placeholder="e.g. B.S. Computer Science" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem 0.75rem 2.5rem'}} />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted mb-1 block">College / University</label>
                  <div style={{position: 'relative'}}>
                    <GraduationCap size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}} />
                    <input type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="w-full p-2 pl-10 rounded-lg" placeholder="e.g. State University" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem 0.75rem 2.5rem'}} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4" style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" disabled={loading} style={{padding: '0.75rem 2rem'}}>Cancel</button>
                <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={loading} style={{padding: '0.75rem 2rem', opacity: loading ? 0.7 : 1}}>
                  {loading ? 'Saving...' : <><Check size={18} /> Save Changes</>}
                </button>
              </div>

            </form>
          ) : (
            <div className="mt-8 flex flex-col gap-6" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem'}}>
              
              <div className="glass p-4 rounded-xl flex items-center gap-4" style={{padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1rem', borderRadius: '12px'}}>
                  <Book size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted m-0" style={{margin: 0}}>Course / Program</p>
                  <p className="m-0 text-lg" style={{margin: '0.25rem 0 0 0', fontWeight: 500}}>{profile?.course || <span style={{opacity: 0.5, fontStyle: 'italic'}}>Not provided</span>}</p>
                </div>
              </div>

              <div className="glass p-4 rounded-xl flex items-center gap-4" style={{padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '1rem', borderRadius: '12px'}}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted m-0" style={{margin: 0}}>College / University</p>
                  <p className="m-0 text-lg" style={{margin: '0.25rem 0 0 0', fontWeight: 500}}>{profile?.college || <span style={{opacity: 0.5, fontStyle: 'italic'}}>Not provided</span>}</p>
                </div>
              </div>

            </div>
          )}
          
        </div>
      </div>

    </div>
  );
};

export default Profile;
