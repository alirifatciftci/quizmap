export interface Celebrity {
  id: string;
  name: string;
  image_url: string;
  birth_year: number;
  birth_date: string;
  shoe_size: number;
  height_cm: number;
  weight_kg: number;
  age: number;
  nationality: string;
  profession: string;
  category_id: string;
  career_start_year: number;
  instagram_followers: number;
  net_worth_usd: number;
}

export type QuestionField =
  | 'birth_year'
  | 'shoe_size'
  | 'height_cm'
  | 'weight_kg'
  | 'age'
  | 'career_start_year'
  | 'instagram_followers'
  | 'net_worth_usd';

export type QuestionType = 'highest' | 'lowest' | 'closest';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  field: QuestionField;
  target: number;
  hint: string;
}

export type GamePhase = 'category' | 'selection' | 'question' | 'result';

export interface GameState {
  phase: GamePhase;
  selectedCategoryId: string;
  pool: Celebrity[];
  deck: Celebrity[];
  usedCards: string[];
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: Answer[];
  gameId: string;
  seed: number;
  opponentAnswers: Answer[] | null;
  opponentName: string | null;
  challengeId: string | null;
}

export interface Answer {
  questionId: string;
  questionType: QuestionType;
  field: QuestionField;
  chosenCelebrityId: string;
  chosenValue: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  total_score: number;
  games_played: number;
  games_won: number;
  avatar_url?: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  creator_id: string;
  creator_username: string;
  game_seed: number;
  category_id: string;
  creator_answers: string | unknown[];
  created_at: string;
  challenger_id?: string;
  challenger_username?: string;
  challenger_answers?: string | unknown[];
}
