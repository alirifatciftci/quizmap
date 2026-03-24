import type { QuestionField } from '../types';

export interface Category {
  id: string;
  name: string;
  description: string;
  emoji: string;
  relevant_fields: QuestionField[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'futbolcular',
    name: 'Futbolcular',
    description: 'Dünyanın en iyi futbolcuları',
    emoji: '⚽',
    relevant_fields: ['height_cm', 'weight_kg', 'shoe_size', 'age', 'birth_year', 'career_start_year', 'instagram_followers', 'net_worth_usd'],
  },
  {
    id: 'uluslararasi_sarkilar',
    name: 'Uluslararası Şarkıcılar',
    description: 'Dünya müzik sahnesinin devleri',
    emoji: '🌍',
    relevant_fields: ['height_cm', 'weight_kg', 'age', 'birth_year', 'career_start_year', 'instagram_followers', 'net_worth_usd'],
  },
  {
    id: 'turk_sarkilar',
    name: 'Türk Şarkıcılar',
    description: "Türkiye'nin pop ve arabesk ikonları",
    emoji: '🎤',
    relevant_fields: ['height_cm', 'weight_kg', 'age', 'birth_year', 'career_start_year', 'instagram_followers', 'net_worth_usd'],
  },
  {
    id: 'hollywood',
    name: 'Hollywood Oyuncuları',
    description: 'Beyazperdenin en büyük yıldızları',
    emoji: '🎬',
    relevant_fields: ['height_cm', 'weight_kg', 'shoe_size', 'age', 'birth_year', 'career_start_year', 'instagram_followers', 'net_worth_usd'],
  },
  {
    id: 'turk_oyuncular',
    name: 'Türk Dizi Oyuncuları',
    description: "Türk dizilerinin sevilen isimleri",
    emoji: '📺',
    relevant_fields: ['height_cm', 'weight_kg', 'age', 'birth_year', 'career_start_year', 'instagram_followers'],
  },
  {
    id: 'sunucular',
    name: 'Sunucular & Komedyenler',
    description: "Türkiye'nin güldüren ve eğlendiren isimleri",
    emoji: '😂',
    relevant_fields: ['age', 'birth_year', 'career_start_year', 'instagram_followers', 'net_worth_usd'],
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);
