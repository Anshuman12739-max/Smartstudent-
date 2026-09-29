import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck } from 'lucide-react';

const ProfileSetup = () => {
  const { updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await updateProfile({ full_name: fullName, course });
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-full h-screen" style={{background: 'var(--bg-dark)'}}>
      <div className="glass p-8 hover-card" style={{padding: '3rem', maxWidth: '400px', width: '90%', textAlign: 'center'}}>
        <div className="flex justify-center mb-6">
          <div className="logo-icon bg-gradient" style={{width: '60px', height: '60px', borderRadius: '16px'}}>
            <UserCheck size={36} color="white" />
          </div>
        </div>
        <h2 className="mb-2">Complete Your <span className="text-gradient">Profile</span></h2>
        <p className="mb-8">Tell us a bit about yourself to personalize your experience.</p>

        {error && (
          <div className="badge badge-danger mb-4" style={{display: 'block', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <input 
            type="text" 
            placeholder="Full Name (e.g. John Doe)" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-3 rounded-lg" 
            style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px'}}
          />
          <input 
            type="text" 
            placeholder="Course / Major (e.g. Computer Science)" 
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            className="p-3 rounded-lg" 
            style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px'}}
          />
          <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{width: '100%', padding: '1rem', opacity: loading ? 0.7 : 1}}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
