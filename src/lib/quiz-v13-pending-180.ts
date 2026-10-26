// Editorial-only registry. Never imported by public pages, actions, or quiz-v13-lots.
// Archival source-only view without reports; active publication decisions are now in quiz-v13-lots.
import type { CandidateLot } from './quiz-v13-editorial';
import izziyya from '../data/quiz-v1.3-pending-180/01-al-mouqaddima-al-izziyya-30-candidats.json' with { type: 'json' };
import masalik from '../data/quiz-v1.3-pending-180/02-ashal-al-masalik-30-candidats.json' with { type: 'json' };
import risala from '../data/quiz-v1.3-pending-180/03-ar-risala-ibn-abi-zayd-30-candidats.json' with { type: 'json' };
import khalil from '../data/quiz-v1.3-pending-180/04-moukhtassar-khalil-30-candidats.json' with { type: 'json' };
import dardir from '../data/quiz-v1.3-pending-180/05-sharh-al-dardir-30-candidats.json' with { type: 'json' };
import dasuqi from '../data/quiz-v1.3-pending-180/06-hashiyat-al-dasuqi-30-candidats.json' with { type: 'json' };
export const pending180Lots: CandidateLot[] = [
  izziyya,
  masalik,
  risala,
  khalil,
  dardir,
  dasuqi,
].map((batch) => ({ batch }));
export const pending180Files = [
  '01-al-mouqaddima-al-izziyya-30-candidats.json',
  '02-ashal-al-masalik-30-candidats.json',
  '03-ar-risala-ibn-abi-zayd-30-candidats.json',
  '04-moukhtassar-khalil-30-candidats.json',
  '05-sharh-al-dardir-30-candidats.json',
  '06-hashiyat-al-dasuqi-30-candidats.json',
];
