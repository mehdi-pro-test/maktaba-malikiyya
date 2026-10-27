'use server';
import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { bookQuestions, findQuizBook, currentQuizData } from '@/lib/quiz-v12-data';
import { quizDbEnabled } from '@/lib/admin/config';
import { globalQuestions, currentGlobalQuestions } from '@/lib/quiz-global-data';
import {
  drawGlobalQuestions,
  drawPublishedQuestions,
  shuffleAttemptChoices,
} from '@/lib/quiz-draw';
const shuffled = (questions: Parameters<typeof shuffleAttemptChoices>[0]) =>
  shuffleAttemptChoices(questions, () => randomInt(2 ** 32) / 2 ** 32);
const input = z.tuple([
  z
    .string()
    .max(80)
    .regex(/^[a-z-]+$/),
  z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]+$/),
]);
/** Public, read-only action. Next enforces POST/origin checks; only IDs are accepted. */
export async function startQuizAttempt(level: string, bookId: string) {
  const [checkedLevel, checkedId] = input.parse([level, bookId]);
  if (quizDbEnabled()) {
    const snapshot = await currentQuizData();
    if (!snapshot.library.find((b) => b.id === checkedId && b.level === checkedLevel)?.available)
      return [];
    return shuffled(
      drawGlobalQuestions(snapshot.pools.get(checkedId) ?? [], () => randomInt(2 ** 32) / 2 ** 32),
    );
  }
  if (!findQuizBook(checkedLevel, checkedId)?.available) return [];
  return shuffled(
    drawPublishedQuestions(
      bookQuestions(checkedLevel, checkedId),
      () => randomInt(2 ** 32) / 2 ** 32,
    ),
  );
}

/** No client pool or IDs accepted. Read-only, fresh selection on every call. */
export async function startGlobalQuizAttempt() {
  return shuffled(
    drawGlobalQuestions(
      quizDbEnabled() ? await currentGlobalQuestions() : globalQuestions(),
      () => randomInt(2 ** 32) / 2 ** 32,
    ),
  );
}
