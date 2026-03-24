import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, Star } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './AuthScreen.css';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const { login, register, loading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);

  const switchMode = (m: Mode) => {
    clearError();
    setMode(m);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(email, password, username);
    }
  };

  return (
    <div className="auth-screen">
      {/* ─ Background glow ─ */}
      <div className="auth-bg-glow" aria-hidden="true" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* ─ Logo ─ */}
        <div className="auth-logo">
          <Star size={28} fill="currentColor" />
          <span>CelebDuel</span>
        </div>

        <p className="auth-tagline">
          Ünlüleri tanıyor musun? Hadi test et!
        </p>

        {/* ─ Mode tabs ─ */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            <LogIn size={15} />
            Giriş Yap
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            <UserPlus size={15} />
            Kayıt Ol
          </button>
          <motion.div
            className="auth-tab-slider"
            animate={{ x: mode === 'login' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </div>

        {/* ─ Form ─ */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            className="auth-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            noValidate
          >
            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="username" className="auth-label">
                  <User size={14} />
                  Kullanıcı Adı
                </label>
                <input
                  id="username"
                  type="text"
                  className="auth-input"
                  placeholder="celebduel_oyuncu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                <Mail size={14} />
                E-posta
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                <Lock size={14} />
                Şifre
              </label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder={mode === 'register' ? 'En az 6 karakter' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* ─ Error ─ */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="auth-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  {mode === 'login' ? 'Giriş yapılıyor...' : 'Kayıt olunuyor...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <p className="auth-switch">
          {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
          {' '}
          <button
            className="auth-switch-btn"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
