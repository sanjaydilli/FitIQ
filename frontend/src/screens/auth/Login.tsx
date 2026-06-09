import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Background } from '../../components/Background';

export function Login() {
  const { theme } = useTheme();
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>💪</div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: -1,
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
          >
            FitIQ
          </div>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700, marginTop: 6 }}>
            INDIA'S SMARTEST FITNESS APP
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSignIn}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            style={inputStyle(theme, emailFocused)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPwFocused(true)}
            onBlur={() => setPwFocused(false)}
            style={inputStyle(theme, pwFocused)}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 12,
                color: '#F87171',
                textAlign: 'center',
                padding: '8px 12px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            type="submit"
            disabled={loading}
            style={{
              padding: '15px', borderRadius: 14, border: 'none', cursor: loading ? 'wait' : 'pointer',
              background: loading ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: theme.onAccent, fontSize: 15, fontWeight: 700, marginTop: 4,
              fontFamily: theme.font,
              boxShadow: loading ? 'none' : `0 8px 24px ${theme.accent}38, 0 2px 6px ${theme.accent}1c, inset 0 1px 0 rgba(255,255,255,0.18)`,
              letterSpacing: 0.2,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: theme.cardBorder }} />
            <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: theme.cardBorder }} />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              padding: '13px', borderRadius: 14, border: `1px solid ${theme.cardBorder}`,
              background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
              color: theme.text, fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: theme.font,
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
          style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: theme.textMute }}
        >
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}
          >
            Sign Up
          </span>
        </motion.div>
      </div>
    </Background>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>['theme'], focused: boolean): React.CSSProperties {
  return {
    padding: '14px 16px',
    borderRadius: 14,
    border: `1px solid ${focused ? theme.accent + '50' : theme.cardBorder}`,
    background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
    color: theme.text,
    fontSize: 14,
    fontFamily: theme.font,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: focused
      ? `0 0 0 3px ${theme.accent}18, inset 0 1px 0 rgba(255,255,255,0.04)`
      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
    transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
  };
}

function friendlyError(msg: string): string {
  if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential'))
    return 'Incorrect email or password';
  if (msg.includes('too-many-requests'))
    return 'Too many attempts. Try again later.';
  if (msg.includes('network'))
    return 'Network error. Check your connection.';
  return 'Sign-in failed. Please try again.';
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
