import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen" style={{background: 'var(--bg-dark)'}}>
      <div className="glass p-8 hover-card" style={{padding: '3rem', maxWidth: '400px', width: '90%', textAlign: 'center'}}>
        <div className="flex justify-center mb-6">
          <div className="logo-icon bg-gradient" style={{width: '60px', height: '60px', borderRadius: '16px'}}>
            <GraduationCap size={36} color="white" />
          </div>
        </div>
        <h2 className="mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="mb-6">Your ultimate academic companion.</p>

        {error && (
          <div className="badge badge-danger mb-4" style={{display: 'block', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            {error}
          </div>
        )}
        
        {message && (
          <div className="badge badge-success mb-4" style={{display: 'block', padding: '0.75rem', borderRadius: '8px', textTransform: 'none', lineHeight: '1.4'}}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-lg" 
            style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px'}}
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded-lg" 
            style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px'}}
          />
          <button 
            type="submit" 
            className="btn btn-primary mt-4" 
            disabled={loading}
            style={{width: '100%', padding: '1rem', opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
              style={{color: 'var(--accent-primary)', fontWeight: 'bold'}}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
