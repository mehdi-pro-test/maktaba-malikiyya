// Server/editorial input only. No raw bank is passed to a browser component.
import raw from '../data/quiz-v1.3-ultime-190/01-BANQUE-190-QUESTIONS-ULTIME.json' with { type: 'json' };
import decision from '../data/quiz-v1.3-ultime-190/08-VALIDATION-PROPRIETAIRE-190.json' with { type: 'json' };
import integrity from '../data/quiz-v1.3-ultime-190/integrity.json' with { type: 'json' };
import { inspectUltimeOwnerBank } from './quiz-ultime-editorial';
import type { ResearchBank } from './quiz-v12';
export function ultimeAdditions(
  base: ResearchBank,
  existing: { id: string; bookId: string; questionFr: string }[],
) {
  return inspectUltimeOwnerBank(base, existing, raw, decision, integrity);
}
