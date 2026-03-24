import { create } from 'zustand';
import type { Celebrity, GameState, GamePhase, Answer, Question } from '../types';
import type { QuestionField } from '../types';
import { generateQuestions, generateSeed } from '../lib/gameEngine';
import { fetchPoolByCategory, getChallengeById } from '../lib/supabase';
import { getCategoryById } from '../lib/categories';

interface GameStore extends GameState {
  startGame: (categoryId: string, seed?: number) => Promise<void>;
  selectCard: (celebrity: Celebrity) => void;
  deselectCard: (celebrityId: string) => void;
  confirmDeck: () => void;
  submitAnswer: (celebrity: Celebrity) => void;
  nextQuestion: () => void;
  resetToCategory: () => void;
  setPhase: (phase: GamePhase) => void;
  loadChallenge: (challengeId: string) => Promise<void>;
  createChallengeAndGetUrl: () => Promise<string>;

  isLoading: boolean;
  error: string | null;

  // Aktif kategori alanları (soru üretimi için)
  _relevantFields: QuestionField[];
}

const initialState: GameState = {
  phase: 'category',
  selectedCategoryId: '',
  pool: [],
  deck: [],
  usedCards: [],
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  gameId: '',
  seed: 0,
  opponentAnswers: null,
  opponentName: null,
  challengeId: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  isLoading: false,
  error: null,
  _relevantFields: [],

  startGame: async (categoryId: string, seed?: number) => {
    const gameSeed = seed ?? generateSeed();
    set({ isLoading: true, error: null });

    try {
      const category = getCategoryById(categoryId);
      if (!category) {
        set({ error: 'Kategori bulunamadı.', isLoading: false });
        return;
      }

      // 2 deneme: ilki başarısız olursa 2 saniye bekle, tekrar dene
      let pool: Celebrity[] | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
        const { data, error } = await fetchPoolByCategory(categoryId, gameSeed, 20);
        if (!error && data && data.length >= 5) { pool = data; break; }
      }

      if (!pool || pool.length < 5) {
        set({
          error: pool && pool.length > 0
            ? `Bu kategoride yeterli ünlü yok. (${pool.length}/5)`
            : 'Sunucuya bağlanılamadı. İnternet bağlantını kontrol et ve tekrar dene.',
          isLoading: false,
        });
        return;
      }

      const questions = generateQuestions(gameSeed, category.relevant_fields, 5);

      set({
        ...initialState,
        seed: gameSeed,
        gameId: `game-${categoryId}-${gameSeed}-${Date.now()}`,
        selectedCategoryId: categoryId,
        pool,
        questions,
        phase: 'selection',
        isLoading: false,
        _relevantFields: category.relevant_fields,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('startGame error:', msg);
      set({ error: `Hata: ${msg}`, isLoading: false });
    }
  },

  selectCard: (celebrity: Celebrity) => {
    const { deck } = get();
    if (deck.length >= 5) return;
    if (deck.find((c) => c.id === celebrity.id)) return;
    set({ deck: [...deck, celebrity] });
  },

  deselectCard: (celebrityId: string) => {
    set((state) => ({ deck: state.deck.filter((c) => c.id !== celebrityId) }));
  },

  confirmDeck: () => {
    const { deck } = get();
    if (deck.length !== 5) return;
    set({ phase: 'question', currentQuestionIndex: 0 });
  },

  submitAnswer: (celebrity: Celebrity) => {
    const { questions, currentQuestionIndex, usedCards, answers } = get();
    const question: Question = questions[currentQuestionIndex];
    const chosenValue = (celebrity[question.field] as number) ?? 0;

    const answer: Answer = {
      questionId: question.id,
      questionType: question.type,
      field: question.field,
      chosenCelebrityId: celebrity.id,
      chosenValue,
    };

    set({ usedCards: [...usedCards, celebrity.id], answers: [...answers, answer] });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    const next = currentQuestionIndex + 1;
    if (next >= questions.length) {
      set({ phase: 'result' });
    } else {
      set({ currentQuestionIndex: next });
    }
  },

  resetToCategory: () => {
    set({ ...initialState, isLoading: false, error: null, _relevantFields: [] });
  },

  setPhase: (phase: GamePhase) => set({ phase }),

  loadChallenge: async (challengeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await getChallengeById(challengeId);
      if (error || !data) {
        set({ error: 'Challenge bulunamadı.', isLoading: false });
        return;
      }
      const opponentAnswers = typeof data.creator_answers === 'string'
        ? JSON.parse(data.creator_answers)
        : (data.creator_answers ?? []);
      set({ opponentAnswers, opponentName: data.creator_username, challengeId });
      // start game with same seed+category
      const { startGame } = get();
      await startGame(data.category_id, data.game_seed);
    } catch (err) {
      console.error('loadChallenge error:', err);
      set({ error: 'Challenge yüklenirken hata oluştu.', isLoading: false });
    }
  },

  createChallengeAndGetUrl: async () => {
    // The actual implementation is in ResultScreen using useAuthStore
    return '';
  },
}));
