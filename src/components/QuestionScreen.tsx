import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Lightbulb, CheckCircle, Users } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getFieldLabel } from '../lib/gameEngine';
import type { Celebrity } from '../types';
import './QuestionScreen.css';

export default function QuestionScreen() {
  const { deck, usedCards, questions, currentQuestionIndex, submitAnswer, nextQuestion } = useGameStore();
  const [chosen, setChosen] = useState<Celebrity | null>(null);
  const [locked, setLocked] = useState(false);

  const question = questions[currentQuestionIndex];
  const totalQ = questions.length;
  const isLastQuestion = currentQuestionIndex + 1 >= totalQ;

  // Auto-advance after locking
  useEffect(() => {
    if (!locked) return;
    const t = setTimeout(() => {
      setChosen(null);
      setLocked(false);
      nextQuestion();
    }, 700);
    return () => clearTimeout(t);
  }, [locked, nextQuestion]);

  const handleChoose = (celeb: Celebrity) => {
    if (locked) return;
    setChosen(prev => prev?.id === celeb.id ? null : celeb);
  };

  const handleConfirm = () => {
    if (!chosen || locked) return;
    submitAnswer(chosen);
    setLocked(true);
  };

  if (!question) return null;

  const typeLabel = question.type === 'highest' ? 'EN YÜKSEK' : question.type === 'lowest' ? 'EN DÜŞÜK' : 'EN YAKIN';
  const availableDeck = deck.filter(c => !usedCards.includes(c.id));

  return (
    <div className="screen question-screen">
      {/* Progress */}
      <motion.div className="q-progress-row" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="q-progress-bar-wrap">
          <motion.div
            className="q-progress-bar"
            animate={{ width: `${((currentQuestionIndex + (locked ? 1 : 0)) / totalQ) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <span className="q-counter">{currentQuestionIndex + 1} / {totalQ}</span>
      </motion.div>

      {/* Question card */}
      <motion.div
        key={`q-${currentQuestionIndex}`}
        className="q-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="q-badge">
          <HelpCircle size={13} />
          {typeLabel} · {getFieldLabel(question.field)}
        </div>
        <p className="q-text">{question.text}</p>
        <div className="q-hint">
          <Lightbulb size={13} />
          {question.hint}
        </div>
      </motion.div>

      {/* Deck label */}
      <div className="deck-section-label">
        <Users size={15} />
        <span>Destenden tahmin et — değerler gizli!</span>
        <span className="deck-remaining">({availableDeck.length} kart kaldı)</span>
      </div>

      {/* Play deck */}
      <div className="play-deck">
        {deck.map((celeb, idx) => {
          const isUsed = usedCards.includes(celeb.id);
          const isChosen = chosen?.id === celeb.id;
          const isDimmed = !!chosen && !isChosen && !isUsed;
          const isLocked = locked && isChosen;

          return (
            <motion.button
              key={celeb.id}
              className={`play-card ${isUsed ? 'used' : ''} ${isChosen ? 'chosen' : ''} ${isDimmed ? 'dimmed' : ''} ${isLocked ? 'locked-in' : ''}`}
              onClick={() => !isUsed && handleChoose(celeb)}
              disabled={isUsed || locked}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
              whileHover={!isUsed && !locked ? { y: -6, scale: 1.03 } : {}}
              whileTap={!isUsed && !locked ? { scale: 0.97 } : {}}
            >
              {celeb.image_url ? (
                <img src={celeb.image_url} alt={celeb.name} className="play-card-img" />
              ) : (
                <div className="play-card-img-placeholder"><Users size={28} /></div>
              )}
              <div className="play-card-info">
                <span className="play-card-name">{celeb.name}</span>
              </div>
              {isUsed && (
                <div className="play-card-used-overlay">
                  <span>Kullanıldı</span>
                </div>
              )}
              <AnimatePresence>
                {isChosen && !locked && (
                  <motion.div
                    className="play-card-chosen-badge"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  >
                    Seçildi
                  </motion.div>
                )}
                {isLocked && (
                  <motion.div
                    className="play-card-locked-badge"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  >
                    <CheckCircle size={12} />
                    {isLastQuestion ? 'Son!' : 'Kilitledi!'}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm button */}
      <AnimatePresence>
        {!locked && (
          <motion.div
            className="q-confirm-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <motion.button
              className="btn-primary q-confirm-btn"
              onClick={handleConfirm}
              disabled={!chosen}
              whileHover={chosen ? { scale: 1.02, y: -2 } : {}}
              whileTap={chosen ? { scale: 0.98 } : {}}
            >
              {chosen ? `"${chosen.name}" cevabım` : 'Bir kart seç'}
              <CheckCircle size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
