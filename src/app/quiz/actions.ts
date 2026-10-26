'use server';
import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { bookQuestions, findQuizBook } from '@/lib/quiz-v12-data';
import { drawPublishedQuestions } from '@/lib/quiz-draw';
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
  if (!findQuizBook(checkedLevel, checkedId)?.available) return [];
  return drawPublishedQuestions(
    bookQuestions(checkedLevel, checkedId),
    () => randomInt(2 ** 32) / 2 ** 32,
  );
}
