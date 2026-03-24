import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { useAuthStore } from './store/useAuthStore';
import CategoryScreen from './components/CategoryScreen';
import SelectionScreen from './components/SelectionScreen';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';
import AuthScreen from './components/AuthScreen';
import { SpiralAnimation } from './components/ui/spiral-animation';
import { CATEGORIES } from './lib/categories';
import './App.css';

export default function App() {
  const { phase, isLoading, error, resetToCategory, selectedCategoryId, loadChallenge } = useGameStore();
  const { initAuth, user, logout, loading: authLoading } = useAuthStore();

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategoryId);

  // Başarılı yüklemede min 4.5sn göster, hata varsa hemen geç
  const [showLoading, setShowLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowLoading(true);
    } else if (error) {
      // Hata varsa hemen kapat
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowLoading(false);
    } else {
      // Başarı: en az 4.5sn göster
      timerRef.current = setTimeout(() => setShowLoading(false), 4500);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isLoading, error]);

  useEffect(() => {
    initAuth();
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challenge');
    if (challengeId) {
      // Store the challenge ID for after auth
      sessionStorage.setItem('pendingChallenge', challengeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    const pendingChallenge = sessionStorage.getItem('pendingChallenge');
    if (pendingChallenge) {
      sessionStorage.removeItem('pendingChallenge');
      loadChallenge(pendingChallenge);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading) {
    return (
      <div className="spiral-loading">
        <SpiralAnimation />
        <div className="spiral-loading-text">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (showLoading) {
    return (
      <div className="spiral-loading">
        <SpiralAnimation />
        <div className="spiral-loading-text">Ünlüler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-loading">
        <div className="error-card">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>Bir hata oluştu</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={resetToCategory}>
            Kategoriye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">

          {/* Logo — kategori seçiminde tıklanamaz, oyun sırasında geri döner */}
          <button
            className="logo"
            onClick={resetToCategory}
            style={{ cursor: 'pointer' }}
            aria-label="Ana menüye dön"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
            </svg>
            <span>CelebDuel</span>
          </button>

          {/* Phase indicator — sadece oyun sırasında göster */}
          {phase !== 'category' && (
            <nav className="phase-indicator" aria-label="Oyun aşamaları">
              {currentCategory && (
                <>
                  <span className="phase-cat">{currentCategory.emoji} {currentCategory.name}</span>
                  <span className="phase-sep" aria-hidden="true">›</span>
                </>
              )}
              <span className={`phase-step ${phase === 'selection' ? 'active' : 'done'}`}>Seçim</span>
              <span className="phase-sep" aria-hidden="true">›</span>
              <span className={`phase-step ${phase === 'question' ? 'active' : phase === 'result' ? 'done' : ''}`}>Oyun</span>
              <span className="phase-sep" aria-hidden="true">›</span>
              <span className={`phase-step ${phase === 'result' ? 'active' : ''}`}>Sonuç</span>
            </nav>
          )}

          <div className="header-user">
            <span className="header-username">{user?.username}</span>
            <button className="btn-ghost header-logout" onClick={logout} aria-label="Çıkış yap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {phase === 'category'  && <CategoryScreen />}
        {phase === 'selection' && <SelectionScreen />}
        {phase === 'question'  && <QuestionScreen />}
        {phase === 'result'    && <ResultScreen />}
      </main>
    </div>
  );
}
