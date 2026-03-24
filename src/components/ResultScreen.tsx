import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Swords, CheckCircle, XCircle, Minus, Trophy, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { getFieldLabel, compareRound } from '../lib/gameEngine';
import { createChallenge } from '../lib/supabase';
import './ResultScreen.css';

export default function ResultScreen() {
  const { answers, questions, deck, seed, selectedCategoryId, opponentAnswers, opponentName, resetToCategory } = useGameStore();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const isChallenge = !!opponentAnswers && opponentAnswers.length > 0;

  // Calculate scores from comparison
  let myScore = 0;
  let theirScore = 0;
  const roundResults: ('win' | 'lose' | 'tie')[] = [];

  if (isChallenge) {
    answers.forEach((ans, i) => {
      const q = questions.find(q => q.id === ans.questionId);
      const theirAns = opponentAnswers[i];
      if (!q || !theirAns) return;
      const result = compareRound(ans.chosenValue, theirAns.chosenValue, ans.questionType, q.target);
      roundResults.push(result);
      if (result === 'win') myScore++;
      else if (result === 'lose') theirScore++;
    });
  }

  const handleChallenge = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase zaman aşımı (10sn)')), 10000)
      );
      const { data, error } = await Promise.race([
        createChallenge(user.id, user.username ?? user.email ?? 'Oyuncu', seed, selectedCategoryId, answers),
        timeoutPromise,
      ]) as Awaited<ReturnType<typeof createChallenge>>;
      console.log('challenge result:', { data, error });
      if (error || !data) { alert('Challenge oluşturulamadı: ' + (error?.message ?? 'Bilinmeyen hata')); return; }
      const url = `${window.location.origin}${window.location.pathname}?challenge=${data.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('handleChallenge catch:', err);
      alert('Hata: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="screen result-screen">
      {/* Hero */}
      <motion.div
        className="result-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {isChallenge ? (
          <>
            <div className="challenge-score-box">
              <div className="challenge-score-me">
                <span className="challenge-score-num" style={{ color: myScore > theirScore ? 'var(--green)' : myScore < theirScore ? 'var(--red)' : 'var(--gold)' }}>
                  {myScore}
                </span>
                <span className="challenge-score-label">Sen</span>
              </div>
              <div className="challenge-score-vs"><Swords size={22} /></div>
              <div className="challenge-score-them">
                <span className="challenge-score-num" style={{ color: theirScore > myScore ? 'var(--green)' : theirScore < myScore ? 'var(--red)' : 'var(--gold)' }}>
                  {theirScore}
                </span>
                <span className="challenge-score-label">{opponentName ?? 'Rakip'}</span>
              </div>
            </div>
            <div className="result-label-wrap">
              <div className="result-trophy">
                <Trophy size={28} style={{ color: myScore > theirScore ? 'var(--gold)' : myScore < theirScore ? 'var(--text-dim)' : 'var(--cyan)' }} />
              </div>
              <h1 className="result-label">
                {myScore > theirScore ? 'Kazandın!' : myScore < theirScore ? 'Kaybettin' : 'Berabere!'}
              </h1>
              <p className="result-sub">{answers.length} sorudan <strong>{myScore} puan</strong> aldın</p>
            </div>
          </>
        ) : (
          <>
            <div className="result-pending-icon">
              <Swords size={48} style={{ color: 'var(--accent-2)' }} />
            </div>
            <div className="result-label-wrap">
              <h1 className="result-label">Oyun Bitti!</h1>
              <p className="result-sub">Cevapların hazır · Bir arkadaşını zorla ve kimin daha iyi bildiğini gör</p>
            </div>
          </>
        )}
      </motion.div>

      {/* Answer breakdown */}
      <section className="breakdown-section">
        <h2 className="breakdown-title">{isChallenge ? 'Tur Sonuçları' : 'Cevaplarım'}</h2>
        <div className="breakdown-list">
          {answers.map((ans, i) => {
            const q = questions.find(q => q.id === ans.questionId);
            const celeb = deck.find(c => c.id === ans.chosenCelebrityId);
            const theirAns = opponentAnswers?.[i];
            const theirCeleb = theirAns ? deck.find(c => c.id === theirAns.chosenCelebrityId) : null;
            const result = roundResults[i];

            return (
              <motion.div
                key={ans.questionId}
                className={`breakdown-item ${result === 'win' ? 'win' : result === 'lose' ? 'lose' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
              >
                <div className="breakdown-num">{i + 1}</div>

                {isChallenge && (
                  <div className={`breakdown-icon ${result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'tie'}`}>
                    {result === 'win' ? <CheckCircle size={15} /> : result === 'lose' ? <XCircle size={15} /> : <Minus size={15} />}
                  </div>
                )}

                <div className="breakdown-content">
                  <p className="breakdown-q">{q?.text}</p>
                  <div className={`breakdown-stats ${isChallenge ? 'vs-mode' : ''}`}>
                    {/* My pick */}
                    <div className="breakdown-pick">
                      {celeb?.image_url && (
                        <img src={celeb.image_url} alt={celeb.name} className="breakdown-celeb-img" />
                      )}
                      <div className="breakdown-details">
                        <span className="breakdown-celeb">{celeb?.name ?? '—'}</span>
                        <span className="breakdown-val">
                          {getFieldLabel(ans.field)}: <b style={{ color: 'var(--cyan)' }}>{ans.chosenValue}</b>
                        </span>
                      </div>
                    </div>

                    {/* VS + opponent */}
                    {isChallenge && theirAns && (
                      <>
                        <div className="breakdown-vs">VS</div>
                        <div className="breakdown-pick their-pick">
                          {theirCeleb?.image_url && (
                            <img src={theirCeleb.image_url} alt={theirCeleb.name} className="breakdown-celeb-img" />
                          )}
                          <div className="breakdown-details">
                            <span className="breakdown-celeb">{theirCeleb?.name ?? opponentName ?? '—'}</span>
                            <span className="breakdown-val">
                              {getFieldLabel(theirAns.field)}: <b style={{ color: result === 'lose' ? 'var(--green)' : 'var(--text-muted)' }}>{theirAns.chosenValue}</b>
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <motion.div
        className="result-actions"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        {!isChallenge && (
          <button
            className="btn-primary result-btn challenge-btn"
            onClick={handleChallenge}
            disabled={creating}
          >
            {creating ? (
              'Oluşturuluyor...'
            ) : copied ? (
              <><Check size={18} /> Link Kopyalandı!</>
            ) : (
              <><Swords size={18} /> Arkadaşını Zorla!</>
            )}
          </button>
        )}
        <button className="btn-secondary result-btn" onClick={resetToCategory}>
          <RotateCcw size={18} />
          Yeni Oyun
        </button>
      </motion.div>
    </div>
  );
}
