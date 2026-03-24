import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';
import { fetchCelebCountByCategory } from '../lib/supabase';
import { useGameStore } from '../store/useGameStore';
import './CategoryScreen.css';

const CATEGORY_META: Record<string, {
  r: number; g: number; b: number;
  tag: string;
  img: string;
}> = {
  futbolcular: {
    r: 16, g: 185, b: 129, tag: 'Spor',
    img: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80&fit=crop',
  },
  uluslararasi_sarkilar: {
    r: 99, g: 102, b: 241, tag: 'Müzik',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80&fit=crop',
  },
  turk_sarkilar: {
    r: 220, g: 38, b: 38, tag: 'Müzik',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80&fit=crop',
  },
  hollywood: {
    r: 217, g: 119, b: 6, tag: 'Sinema',
    img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80&fit=crop',
  },
  turk_oyuncular: {
    r: 59, g: 130, b: 246, tag: 'Dizi',
    img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80&fit=crop',
  },
  sunucular: {
    r: 168, g: 85, b: 247, tag: 'Eğlence',
    img: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80&fit=crop',
  },
};

export default function CategoryScreen() {
  const { startGame, isLoading } = useGameStore();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selecting, setSelecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchCelebCountByCategory().then(setCounts);
  }, []);

  /* ── Wave canvas background ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let time = 0;
    let animId: number;

    const waveData = Array.from({ length: 8 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const update = () => {
      waveData.forEach(d => {
        if (Math.random() < 0.008) d.targetValue = Math.random() * 0.7 + 0.1;
        d.value += (d.targetValue - d.value) * d.speed;
      });
    };

    const draw = () => {
      ctx.fillStyle = '#0d0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      waveData.forEach((d, i) => {
        const freq = d.value * 7;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const nx = (x / canvas.width) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
          const y  = (py + 1) * canvas.height / 2;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const intensity = Math.min(1, freq * 0.3);
        const r = Math.round(79  + intensity * 100);
        const g = Math.round(70  + intensity * 130);
        const b = 229;
        ctx.lineWidth    = 1 + i * 0.3;
        ctx.strokeStyle  = `rgba(${r},${g},${b},0.45)`;
        ctx.shadowColor  = `rgba(${r},${g},${b},0.4)`;
        ctx.shadowBlur   = 6;
        ctx.stroke();
        ctx.shadowBlur   = 0;
      });
    };

    const animate = () => {
      time += 0.018;
      update();
      draw();
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSelect = async (categoryId: string) => {
    setSelecting(categoryId);
    await startGame(categoryId);
    setSelecting(null);
  };

  return (
    <div className="screen category-screen">
      {/* Full-screen wave canvas */}
      <canvas ref={canvasRef} className="wave-canvas" />

      <motion.div
        className="category-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="section-title">
          Bir <span className="gradient-text">Kategori</span> Seç
        </h1>
        <p className="section-sub">Her kategoride farklı ünlüler ve sorular seni bekliyor</p>
      </motion.div>

      <div className="category-grid">
        {CATEGORIES.map((cat, idx) => {
          const count    = counts[cat.id] ?? 0;
          const busy     = selecting === cat.id;
          const disabled = isLoading || (count > 0 && count < 5);
          const meta     = CATEGORY_META[cat.id];
          const accentHex = meta ? `rgb(${meta.r},${meta.g},${meta.b})` : '#7c3aed';

          return (
            <motion.button
              key={cat.id}
              className={`category-card${busy ? ' loading' : ''}`}
              onClick={() => handleSelect(cat.id)}
              disabled={disabled}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              transition={{ duration: 0.38, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={!disabled ? { y: -6, scale: 1.02 } : {}}
              whileTap={!disabled  ? { scale: 0.97 }         : {}}
              style={{ '--accent': accentHex } as React.CSSProperties}
            >
              {/* Gradient border via pseudo — CSS var drives color */}

              {/* Inner visualiser area */}
              <div className="card-visual">
                {/* Category photo */}
                {meta?.img && (
                  <img
                    src={meta.img}
                    alt={cat.name}
                    className="card-photo"
                    loading="lazy"
                    draggable={false}
                  />
                )}
                {/* Color overlay tinted by accent */}
                <div
                  className="card-photo-overlay"
                  style={{ background: `linear-gradient(160deg, rgba(${meta?.r??124},${meta?.g??58},${meta?.b??237},0.45) 0%, rgba(0,0,0,0.55) 100%)` }}
                />
                {/* Animated dot-grid */}
                <div className="card-grid-overlay" />
                {/* Pulsing glow orb */}
                <div className="card-glow-orb" style={{ background: accentHex }} />
              </div>

              {/* Divider */}
              <div className="card-divider" />

              {/* Bottom info */}
              <div className="card-body">
                <div>
                  <span className="card-tag" style={{ color: accentHex, borderColor: `${accentHex}55` }}>
                    {meta?.tag ?? 'Kategori'}
                  </span>
                  <h2 className="card-title">{cat.name}</h2>
                  <p className="card-desc">{cat.description}</p>
                </div>
                <div className="card-footer">
                  <span className="card-count">
                    <Users size={11} />
                    {count > 0 ? `${count} ünlü` : '—'}
                  </span>
                  {busy
                    ? <span className="card-spinner" />
                    : <span className="card-manage">Oyna →</span>
                  }
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
