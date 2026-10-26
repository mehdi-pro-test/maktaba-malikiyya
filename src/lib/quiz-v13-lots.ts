// Owner declared verification and authorized publication of 270 additional questions on 2026-10-26.
// Immutable supplied text; separate reports record the owner's declaration, not a Codex review.
import type { CandidateLot } from './quiz-v13-editorial';
import akhdari from '../data/quiz-v1.3/01-akhdari-30-candidats.json' with { type: 'json' };
import akhdariReview from '../data/quiz-v1.3/01-akhdari-30-candidats-reviews.json' with { type: 'json' };
import ibnAshir from '../data/quiz-v1.3/02-ibn-ashir-30-candidats.json' with { type: 'json' };
import ibnAshirReview from '../data/quiz-v1.3/02-ibn-ashir-30-candidats-reviews.json' with { type: 'json' };
import achmawiyya from '../data/quiz-v1.3/03-achmawiyya-30-candidats.json' with { type: 'json' };
import achmawiyyaReview from '../data/quiz-v1.3/03-achmawiyya-30-candidats-reviews.json' with { type: 'json' };
import izziyya from '../data/quiz-v1.3-pending-180/01-al-mouqaddima-al-izziyya-30-candidats.json' with { type: 'json' };
import izziyyaReview from '../data/quiz-v1.3-180-reviews/01-al-mouqaddima-al-izziyya-30-candidats-reviews.json' with { type: 'json' };
import masalik from '../data/quiz-v1.3-pending-180/02-ashal-al-masalik-30-candidats.json' with { type: 'json' };
import masalikReview from '../data/quiz-v1.3-180-reviews/02-ashal-al-masalik-30-candidats-reviews.json' with { type: 'json' };
import risala from '../data/quiz-v1.3-pending-180/03-ar-risala-ibn-abi-zayd-30-candidats.json' with { type: 'json' };
import risalaReview from '../data/quiz-v1.3-180-reviews/03-ar-risala-ibn-abi-zayd-30-candidats-reviews.json' with { type: 'json' };
import khalil from '../data/quiz-v1.3-pending-180/04-moukhtassar-khalil-30-candidats.json' with { type: 'json' };
import khalilReview from '../data/quiz-v1.3-180-reviews/04-moukhtassar-khalil-30-candidats-reviews.json' with { type: 'json' };
import dardir from '../data/quiz-v1.3-pending-180/05-sharh-al-dardir-30-candidats.json' with { type: 'json' };
import dardirReview from '../data/quiz-v1.3-180-reviews/05-sharh-al-dardir-30-candidats-reviews.json' with { type: 'json' };
import dasuqi from '../data/quiz-v1.3-pending-180/06-hashiyat-al-dasuqi-30-candidats.json' with { type: 'json' };
import dasuqiReview from '../data/quiz-v1.3-180-reviews/06-hashiyat-al-dasuqi-30-candidats-reviews.json' with { type: 'json' };
export const editorialLots: CandidateLot[] = [
  { batch: akhdari, report: akhdariReview },
  { batch: ibnAshir, report: ibnAshirReview },
  { batch: achmawiyya, report: achmawiyyaReview },
  { batch: izziyya, report: izziyyaReview },
  { batch: masalik, report: masalikReview },
  { batch: risala, report: risalaReview },
  { batch: khalil, report: khalilReview },
  { batch: dardir, report: dardirReview },
  { batch: dasuqi, report: dasuqiReview },
];
