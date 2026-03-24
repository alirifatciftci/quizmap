import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, PlayCircle, Users } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import type { Celebrity } from '../types';
import './SelectionScreen.css';

export default function SelectionScreen() {
  const { pool, deck, selectCard, deselectCard, confirmDeck } = useGameStore();
  const MAX = 5;

  const isSelected = (id: string) => deck.some((c) => c.id === id);
  const canSelect = deck.length < MAX;

  const handleToggle = (celeb: Celebrity) => {
    if (isSelected(celeb.id)) {
      deselectCard(celeb.id);
    } else if (canSelect) {
      selectCard(celeb);
    }
  };

  return (
    <div className="screen selection-screen">

      {/* ─ Header ─ */}
      <motion.div
        className="selection-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="section-title">
            Desteni <span className="gradient-text">Oluştur</span>
          </h1>
          <p className="section-sub">
            20 ünlüden 5 tanesini seç · Sorularda onları kullanacaksın
          </p>
        </div>

        <div className="header-right">
          <div className="deck-counter">
            <motion.span
              key={deck.length}
              className="deck-count-num"
              initial={{ scale: 1.4 }}
              animate={{
                scale: 1,
                color: deck.length === MAX ? '#10b981' : '#a855f7',
              }}
              transition={{ duration: 0.25 }}
            >
              {deck.length}
            </motion.span>
            <span className="deck-count-sep">/</span>
            <span className="deck-count-total">{MAX}</span>
          </div>

          <AnimatePresence>
            {deck.length === MAX && (
              <motion.button
                className="btn-primary"
                onClick={confirmDeck}
                initial={{ opacity: 0, scale: 0.85, x: 12 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                aria-label="Oyunu başlat"
              >
                <PlayCircle size={18} />
                Oyunu Başlat
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─ Progress bar ─ */}
      <div className="deck-progress" role="progressbar" aria-valuenow={deck.length} aria-valuemax={MAX}>
        <motion.div
          className="deck-progress-bar"
          animate={{ width: `${(deck.length / MAX) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* ─ Selected deck preview ─ */}
      <AnimatePresence>
        {deck.length > 0 && (
          <motion.div
            className="deck-preview"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
          >
            {deck.map((celeb) => (
              <motion.button
                key={celeb.id}
                className="deck-chip"
                onClick={() => deselectCard(celeb.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                title={`${celeb.name} - kaldırmak için tıkla`}
                aria-label={`${celeb.name} seçimini kaldır`}
              >
                {celeb.image_url ? (
                  <img src={celeb.image_url} alt={celeb.name} className="deck-chip-img" />
                ) : (
                  <div className="deck-chip-placeholder"><Users size={14} /></div>
                )}
                <span>{celeb.name.split(' ')[0]}</span>
                <X size={12} className="chip-remove" />
              </motion.button>
            ))}

            {Array.from({ length: MAX - deck.length }).map((_, i) => (
              <div key={`empty-${i}`} className="deck-chip deck-chip-empty" aria-hidden="true">
                <Plus size={16} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─ Celebrity grid ─ */}
      <motion.div
        className="celeb-grid"
        role="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {pool.map((celeb, idx) => {
          const selected = isSelected(celeb.id);
          const disabled = !selected && !canSelect;

          return (
            <motion.div
              key={celeb.id}
              role="listitem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.025 }}
            >
              <button
                className={`celeb-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => handleToggle(celeb)}
                aria-pressed={selected}
                aria-label={`${celeb.name}, ${celeb.profession}${selected ? ', seçildi' : ''}`}
              >
                {celeb.image_url ? (
                  <img
                    src={celeb.image_url}
                    alt={celeb.name}
                    className="celeb-card-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="celeb-card-img-placeholder">
                    <Users size={22} />
                    <span className="placeholder-name">{celeb.name}</span>
                    <span className="placeholder-meta">{celeb.profession}</span>
                  </div>
                )}

                {celeb.image_url && (
                  <div className="celeb-card-info">
                    <div className="celeb-card-name">{celeb.name}</div>
                    <div className="celeb-card-meta">{celeb.profession}</div>
                  </div>
                )}

                <AnimatePresence>
                  {selected && (
                    <motion.div
                      className="celeb-card-check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                      aria-hidden="true"
                    >
                      <Check size={14} strokeWidth={3} color="#fff" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {disabled && <div className="celeb-card-overlay" aria-hidden="true" />}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}
