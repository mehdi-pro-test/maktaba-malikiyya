'use server';
import { randomInt } from 'node:crypto';
import { syntheticPool } from '../../quiz-pool';
import { drawPublishedQuestions } from '../../../../src/lib/quiz-draw';
export async function syntheticAttempt() {
  return drawPublishedQuestions(syntheticPool(100), () => randomInt(2 ** 32) / 2 ** 32);
}
