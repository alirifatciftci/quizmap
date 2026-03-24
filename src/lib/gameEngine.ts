import type { Question, QuestionField, QuestionType, Celebrity } from '../types';
import { seededShuffle } from './supabase';

// ─── Tüm soru şablonları ──────────────────────────────────────
const ALL_TEMPLATES: Array<{
  type: QuestionType;
  field: QuestionField;
  target?: number;
  getText: () => string;
  getHint: () => string;
}> = [
  // ── BOY ──────────────────────────────────────────────────────
  { type: 'highest', field: 'height_cm',
    getText: () => 'En uzun boylu kim?',
    getHint:  () => 'En yüksek boy değerini tahmin et' },
  { type: 'lowest',  field: 'height_cm',
    getText: () => 'En kısa boylu kim?',
    getHint:  () => 'En düşük boy değerini tahmin et' },
  { type: 'closest', field: 'height_cm', target: 180,
    getText: () => '180 cm boya en yakın kim?',
    getHint:  () => 'Hedef boy: 180 cm' },
  { type: 'closest', field: 'height_cm', target: 170,
    getText: () => '170 cm boya en yakın kim?',
    getHint:  () => 'Hedef boy: 170 cm' },

  // ── KİLO ─────────────────────────────────────────────────────
  { type: 'highest', field: 'weight_kg',
    getText: () => 'En ağır kim?',
    getHint:  () => 'En yüksek kilo değerini tahmin et' },
  { type: 'lowest',  field: 'weight_kg',
    getText: () => 'En hafif kim?',
    getHint:  () => 'En düşük kilo değerini tahmin et' },
  { type: 'closest', field: 'weight_kg', target: 75,
    getText: () => "75 kg'a en yakın kim?",
    getHint:  () => 'Hedef kilo: 75 kg' },

  // ── AYAKKABI ─────────────────────────────────────────────────
  { type: 'highest', field: 'shoe_size',
    getText: () => 'En büyük ayakkabı numarasına sahip kim?',
    getHint:  () => 'En büyük Avrupa ayakkabı numarasını tahmin et' },
  { type: 'lowest',  field: 'shoe_size',
    getText: () => 'En küçük ayakkabı numarasına sahip kim?',
    getHint:  () => 'En küçük Avrupa ayakkabı numarasını tahmin et' },
  { type: 'closest', field: 'shoe_size', target: 42,
    getText: () => '42 numara ayakkabıya en yakın kim?',
    getHint:  () => 'Hedef numara: 42' },

  // ── YAŞ ──────────────────────────────────────────────────────
  { type: 'highest', field: 'age',
    getText: () => 'En yaşlı kim?',
    getHint:  () => 'En büyük yaşa sahip kişiyi tahmin et' },
  { type: 'lowest',  field: 'age',
    getText: () => 'En genç kim?',
    getHint:  () => 'En küçük yaşa sahip kişiyi tahmin et' },
  { type: 'closest', field: 'age', target: 35,
    getText: () => '35 yaşına en yakın kim?',
    getHint:  () => 'Hedef yaş: 35' },
  { type: 'closest', field: 'age', target: 50,
    getText: () => '50 yaşına en yakın kim?',
    getHint:  () => 'Hedef yaş: 50' },

  // ── DOĞUM YILI ───────────────────────────────────────────────
  { type: 'highest', field: 'birth_year',
    getText: () => 'En son doğan kim?',
    getHint:  () => 'En yüksek doğum yılını tahmin et' },
  { type: 'lowest',  field: 'birth_year',
    getText: () => 'En önce doğan kim?',
    getHint:  () => 'En düşük doğum yılını tahmin et' },
  { type: 'closest', field: 'birth_year', target: 1990,
    getText: () => 'Doğum yılı 1990\'a en yakın kim?',
    getHint:  () => 'Hedef doğum yılı: 1990' },
  { type: 'closest', field: 'birth_year', target: 1980,
    getText: () => 'Doğum yılı 1980\'e en yakın kim?',
    getHint:  () => 'Hedef doğum yılı: 1980' },
  { type: 'closest', field: 'birth_year', target: 1969,
    getText: () => "Apollo 11'in Ay'a indiği yıla (1969) doğum yılı en yakın kim?",
    getHint:  () => 'Hedef doğum yılı: 1969' },

  // ── KARİYER BAŞLANGICI ───────────────────────────────────────
  { type: 'lowest',  field: 'career_start_year',
    getText: () => 'Kariyerine en erken başlayan kim?',
    getHint:  () => 'En eski kariyer başlangıç yılını tahmin et' },
  { type: 'highest', field: 'career_start_year',
    getText: () => 'Kariyerine en geç başlayan kim?',
    getHint:  () => 'En yeni kariyer başlangıç yılını tahmin et' },
  { type: 'closest', field: 'career_start_year', target: 2000,
    getText: () => "2000'e en yakın yılda kariyerine başlayan kim?",
    getHint:  () => 'Hedef kariyer başlangıcı: 2000' },
  { type: 'closest', field: 'career_start_year', target: 2010,
    getText: () => "2010'a en yakın yılda kariyerine başlayan kim?",
    getHint:  () => 'Hedef kariyer başlangıcı: 2010' },

  // ── INSTAGRAM ────────────────────────────────────────────────
  { type: 'highest', field: 'instagram_followers',
    getText: () => 'En fazla Instagram takipçisine sahip kim?',
    getHint:  () => 'En yüksek Instagram takipçi sayısını (milyon) tahmin et' },
  { type: 'lowest',  field: 'instagram_followers',
    getText: () => 'En az Instagram takipçisine sahip kim?',
    getHint:  () => 'En düşük Instagram takipçi sayısını tahmin et' },
  { type: 'closest', field: 'instagram_followers', target: 50,
    getText: () => "Instagram'da 50 milyon takipçiye en yakın kim?",
    getHint:  () => 'Hedef: 50 milyon Instagram takipçisi' },
  { type: 'closest', field: 'instagram_followers', target: 200,
    getText: () => "Instagram'da 200 milyon takipçiye en yakın kim?",
    getHint:  () => 'Hedef: 200 milyon Instagram takipçisi' },

  // ── NET DEĞER ────────────────────────────────────────────────
  { type: 'highest', field: 'net_worth_usd',
    getText: () => 'En zengin kim? (net servet)',
    getHint:  () => 'En yüksek net serveti (milyon $) tahmin et' },
  { type: 'lowest',  field: 'net_worth_usd',
    getText: () => "Net serveti en düşük kim?",
    getHint:  () => 'En düşük net serveti tahmin et' },
  { type: 'closest', field: 'net_worth_usd', target: 100,
    getText: () => 'Net değeri 100 milyon dolara en yakın kim?',
    getHint:  () => 'Hedef servet: 100 milyon $' },
  { type: 'closest', field: 'net_worth_usd', target: 300,
    getText: () => 'Net değeri 300 milyon dolara en yakın kim?',
    getHint:  () => 'Hedef servet: 300 milyon $' },
];

// ─── Soru üretici ─────────────────────────────────────────────
export function generateQuestions(
  seed: number,
  relevantFields: QuestionField[],
  count = 5
): Question[] {
  const filtered = ALL_TEMPLATES.filter((t) => relevantFields.includes(t.field));
  const shuffled = seededShuffle([...filtered], seed);
  const questions: Question[] = [];
  const usedCombos = new Set<string>();

  for (const tpl of shuffled) {
    if (questions.length >= count) break;
    const key = `${tpl.type}-${tpl.field}`;
    if (usedCombos.has(key)) continue;

    questions.push({
      id: `q-${questions.length}`,
      type: tpl.type,
      text: tpl.getText(),
      field: tpl.field,
      target: tpl.target ?? 0,
      hint: tpl.getHint(),
    });
    usedCombos.add(key);
  }

  return questions.slice(0, count);
}

// ─── Yeni mekanik yardımcıları ────────────────────────────────
export function getChosenValue(celebrity: Celebrity, question: Question): number {
  return (celebrity[question.field] as number) ?? 0;
}

export function compareRound(
  myValue: number,
  theirValue: number,
  questionType: QuestionType,
  target = 0
): 'win' | 'lose' | 'tie' {
  if (questionType === 'highest') return myValue > theirValue ? 'win' : myValue < theirValue ? 'lose' : 'tie';
  if (questionType === 'lowest') return myValue < theirValue ? 'win' : myValue > theirValue ? 'lose' : 'tie';
  const myDist = Math.abs(myValue - target);
  const theirDist = Math.abs(theirValue - target);
  return myDist < theirDist ? 'win' : myDist > theirDist ? 'lose' : 'tie';
}

// ─── Yardımcılar ──────────────────────────────────────────────
export function getScoreLabel(score: number, total: number): string {
  const pct = score / total;
  if (pct === 1)  return 'Mükemmel!';
  if (pct >= 0.8) return 'Harika!';
  if (pct >= 0.6) return 'İyi İş!';
  if (pct >= 0.4) return 'Fena Değil';
  return 'Daha Çok Çalış!';
}

export function getFieldLabel(field: QuestionField): string {
  const labels: Record<QuestionField, string> = {
    birth_year:          'Doğum Yılı',
    height_cm:           'Boy (cm)',
    shoe_size:           'Ayakkabı No',
    weight_kg:           'Kilo (kg)',
    age:                 'Yaş',
    career_start_year:   'Kariyer Başlangıcı',
    instagram_followers: 'Instagram (M)',
    net_worth_usd:       'Servet (M$)',
  };
  return labels[field];
}

export function generateSeed(): number {
  return Math.floor(Math.random() * 999999) + 100000;
}
