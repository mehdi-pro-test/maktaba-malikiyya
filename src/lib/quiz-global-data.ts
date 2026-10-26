import 'server-only';
import { library, bookQuestions, currentQuizData } from './quiz-v12-data';
import { assembleGlobalPool } from './quiz-global-pool';
// Bank validation happens in the authoritative modules. Never cache an attempt.
export function globalQuestions() {
  return assembleGlobalPool(library, bookQuestions);
}
export function globalQuestionCount() {
  return globalQuestions().length;
}

export async function currentGlobalQuestions() {
  const snapshot = await currentQuizData();
  return assembleGlobalPool(snapshot.library, (_level, id) => snapshot.pools.get(id) ?? []);
}
export async function currentGlobalQuestionCount() {
  return (await currentGlobalQuestions()).length;
}
