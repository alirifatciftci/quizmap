import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY .env dosyasında tanımlı değil.\n' +
    'Lütfen projenizin kök dizininde .env dosyası oluşturun.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);

// ─── Auth helpers ───────────────────────────────────────────
export const signUp = (email: string, password: string, username: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ─── Celebrity helpers ───────────────────────────────────────
export const fetchCelebrities = () =>
  supabase.from('celebrities').select('*').order('name');

export const fetchCelebCountByCategory = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('celebrities')
    .select('category_id');
  if (error || !data) return {};
  return data.reduce<Record<string, number>>((acc, row) => {
    acc[row.category_id] = (acc[row.category_id] ?? 0) + 1;
    return acc;
  }, {});
};

export const fetchPoolByCategory = async (categoryId: string, seed: number, poolSize = 20) => {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), 9000);

  try {
    const { data, error } = await supabase
      .from('celebrities')
      .select('*')
      .eq('category_id', categoryId)
      .abortSignal(controller.signal);

    clearTimeout(timerId);
    if (error || !data) return { data: null, error };
    const seeded = seededShuffle([...data], seed).slice(0, poolSize);
    return { data: seeded, error: null };
  } catch (err: unknown) {
    clearTimeout(timerId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      data: null,
      error: { message: isAbort ? 'TIMEOUT' : String(err) } as { message: string },
    };
  }
};

// ─── Game helpers ─────────────────────────────────────────────
export const saveGameResult = async (
  userId: string,
  score: number,
  seed: number,
  answers: unknown[]
) => {
  return supabase.from('game_results').insert({
    user_id: userId,
    score,
    seed,
    answers: JSON.stringify(answers),
    played_at: new Date().toISOString(),
  });
};

export const createChallenge = async (
  creatorId: string,
  creatorUsername: string,
  seed: number,
  categoryId: string,
  creatorAnswers: unknown[]
) => {
  return supabase.from('challenges').insert({
    creator_id: creatorId,
    creator_username: creatorUsername,
    game_seed: seed,
    category_id: categoryId,
    creator_answers: JSON.stringify(creatorAnswers),
  }).select().single();
};

export const getChallengeById = (challengeId: string) =>
  supabase.from('challenges').select('*').eq('id', challengeId).single();

export const submitChallengeResponse = (
  challengeId: string,
  challengerId: string,
  challengerUsername: string,
  challengerAnswers: unknown[]
) =>
  supabase.from('challenges').update({
    challenger_id: challengerId,
    challenger_username: challengerUsername,
    challenger_answers: JSON.stringify(challengerAnswers),
  }).eq('id', challengeId);

export const getUserProfile = (userId: string) =>
  supabase.from('profiles').select('*').eq('id', userId).single();

export const updateUserStats = (userId: string, score: number) =>
  supabase.rpc('update_user_stats', { p_user_id: userId, p_score: score });

export const getLeaderboard = (limit = 10) =>
  supabase
    .from('profiles')
    .select('username, total_score, games_played, avatar_url')
    .order('total_score', { ascending: false })
    .limit(limit);

// ─── Seeded shuffle (Fisher-Yates) ────────────────────────────
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
