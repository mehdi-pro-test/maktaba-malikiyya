import 'server-only';
import { library, bookQuestions } from './quiz-v12-data';
import { assembleGlobalPool } from './quiz-global-pool';
// Bank validation happens in the authoritative modules. Never cache an attempt.
export function globalQuestions() {
  return assembleGlobalPool(library, bookQuestions);
}
export function globalQuestionCount() {
  return globalQuestions().length;
}
