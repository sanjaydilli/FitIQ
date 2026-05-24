import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Background } from '../../components/Background';

export function Signup() {
  const { theme } = useTheme();
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError('All fields are required'); return; }
    if (password !== confirm)         { setError('Passwords do not match'); return; }
    if (password.length < 6)         { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      // Store email so Home can show the "check your inbox" banner after redirect
      sessionStorage.setItem('fitiq.pendingVerifyEmail', email);
      await signUp(email, password, name);
    } catch (err: unknown) {
      sessionStorage.removeItem('fitiq.pendingVerifyEmail');
      setError(err instanceof Error ? friendlyError(err.message) : 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', overflowY: 'auto' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <div style={{ fontSize: 40, marginBottom: 6 }}>💪</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Create Account</div>
          <div style={{ fontSize: 12, color: theme.textMute, marginTop: 4 }}>
            Start your FitIQ journey
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSignUp}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle(theme)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle(theme)}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle(theme)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={inputStyle(theme)}
          />

          {error && (
            <div style={{ fontSize: 12, color: '#F87171', textAlign: 'center' }}>
              {error}
            </div>
          )}


          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 4,
            }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              padding: '13px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
              color: theme.text, fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ textAlign: 'center', marginTop: 24, marginBottom: 24, fontSize: 13, color: theme.textMute }}
        >
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In
          </span>
        </motion.div>
      </div>
    </Background>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>['theme']): React.CSSProperties {
  return {
    padding: '14px 16px',
    borderRadius: 14,
    border: `1px solid ${theme.cardBorder}`,
    background: 'rgba(255,255,255,0.05)',
    color: theme.text,
    fontSize: 14,
    fontFamily: theme.font,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };
}

function friendlyError(msg: string): string {
  if (msg.includes('email-already-in-use')) return 'That email is already registered';
  if (msg.includes('invalid-email'))        return 'Invalid email address';
  if (msg.includes('weak-password'))        return 'Password is too weak';
  if (msg.includes('network'))              return 'Network error. Check your connection.';
  return 'Sign-up failed. Please try again.';
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C36.9 36.3 44 31 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
