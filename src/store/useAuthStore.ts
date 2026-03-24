import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types';
import { supabase, signIn, signUp, signOut } from '../lib/supabase';

interface AuthState {
  user: UserProfile | null;
  session: unknown | null;
  loading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,

      initAuth: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({ session, user: profile ?? null });
        }
        set({ loading: false });

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            set({ session, user: profile ?? null });
          } else {
            set({ session: null, user: null });
          }
        });
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        const { data, error } = await signIn(email, password);
        if (error) {
          set({ error: 'E-posta veya şifre hatalı.', loading: false });
          return;
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          set({ user: profile ?? null, session: data.session });
        }
        set({ loading: false });
      },

      register: async (email, password, username) => {
        set({ loading: true, error: null });
        const { data, error } = await signUp(email, password, username);
        if (error) {
          set({ error: error.message, loading: false });
          return;
        }
        if (data.user) {
          // Profile trigger ile otomatik oluşturulur, ama fallback olarak:
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            email,
            total_score: 0,
            games_played: 0,
            games_won: 0,
          });
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          set({ user: profile ?? null, session: data.session });
        }
        set({ loading: false });
      },

      logout: async () => {
        await signOut();
        set({ user: null, session: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'celebduel-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
