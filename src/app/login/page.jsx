'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111111',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: 40,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.jpg" alt="Retro Revival" style={{
            width: 160, height: 160, borderRadius: 16, objectFit: 'cover',
            marginBottom: 16,
          }} />
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24, fontWeight: 700, color: '#d4a853', marginBottom: 4,
          }}>Retro Revival</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Inventory Manager</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 12, color: '#888',
              textTransform: 'uppercase', letterSpacing: 0.5,
              fontWeight: 600, marginBottom: 6,
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 14px',
                background: '#222', border: '1px solid #333',
                borderRadius: 8, color: '#e8e0d4', fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 12, color: '#888',
              textTransform: 'uppercase', letterSpacing: 0.5,
              fontWeight: 600, marginBottom: 6,
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              style={{
                width: '100%', padding: '12px 14px',
                background: '#222', border: '1px solid #333',
                borderRadius: 8, color: '#e8e0d4', fontSize: 14,
              }}
            />
          </div>

          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
              background: message.includes('Check') ? 'rgba(76,175,80,0.1)' : 'rgba(231,76,60,0.1)',
              border: `1px solid ${message.includes('Check') ? 'rgba(76,175,80,0.3)' : 'rgba(231,76,60,0.3)'}`,
              color: message.includes('Check') ? '#4caf50' : '#e74c3c',
            }}>{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#555' : 'linear-gradient(135deg, #d4a853, #b8862d)',
              color: '#1a1a1a', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer',
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            style={{
              background: 'none', border: 'none', color: '#d4a853',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
