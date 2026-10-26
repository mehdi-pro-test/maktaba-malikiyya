import 'server-only';
import { db } from './db';
export function readQuizOverlay() {
  return db.quizQuestionRecord.findMany({ include: { activeRevision: true } });
}
