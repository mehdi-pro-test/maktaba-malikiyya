// Owner confirmed review and authorized publication of these 90 questions on 2026-10-26.
// Immutable supplied text; separate reports record the owner's declaration, not a Codex review.
import type { CandidateLot } from './quiz-v13-editorial';
import akhdari from '../data/quiz-v1.3/01-akhdari-30-candidats.json';
import akhdariReview from '../data/quiz-v1.3/01-akhdari-30-candidats-reviews.json';
import ibnAshir from '../data/quiz-v1.3/02-ibn-ashir-30-candidats.json';
import ibnAshirReview from '../data/quiz-v1.3/02-ibn-ashir-30-candidats-reviews.json';
import achmawiyya from '../data/quiz-v1.3/03-achmawiyya-30-candidats.json';
import achmawiyyaReview from '../data/quiz-v1.3/03-achmawiyya-30-candidats-reviews.json';
export const editorialLots: CandidateLot[] = [
  { batch: akhdari, report: akhdariReview },
  { batch: ibnAshir, report: ibnAshirReview },
  { batch: achmawiyya, report: achmawiyyaReview },
];
