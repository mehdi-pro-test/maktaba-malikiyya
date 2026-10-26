// Server-side registry of future editorial lots. No new lot is authorized today.
// Add a batch AND its independent, verified 1.3-review-1 report after editorial approval.
import type { CandidateLot } from './quiz-v13-editorial';
export const editorialLots: CandidateLot[] = [];
