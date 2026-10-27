import { it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import raw from '../src/data/quiz-v1.5/editorial.json';
import { library, bookQuestions } from '../src/lib/quiz-v12-data';
import { globalQuestions } from '../src/lib/quiz-global-data';
import { applyEditorialV15, editorialV15Inventory } from '../src/lib/quiz-editorial-v15';
import { shuffleAttemptChoices } from '../src/lib/quiz-draw';
import { quizScore } from '../src/lib/quiz';
import { originalLiveBank } from './fixtures/quiz-live-bank';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import historicalInputs from '../docs/v1.5/historical-input-sha256.json';
import { syntheticPool } from './fixtures/quiz-pool';
it('610 questions restent disponibles ; les 476 révisions gardent leurs bonnes réponses et leurs sources', () => {
  const current = library.flatMap((b) => bookQuestions(b.level, b.id));
  expect(current).toHaveLength(610);
  expect(globalQuestions()).toHaveLength(469);
  expect(editorialV15Inventory).toEqual({ reviewed: 610, rewritten: 476, promptsClarified: 13 });
  for (const entry of raw.entries) {
    const q = current.find((q) => q.id === entry.questionId)!;
    expect(q).toBeDefined();
    expect(entry.wrongOptions.every((o) => !q.correctOptionIds.includes(o.id))).toBe(true);
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
    for (const o of entry.wrongOptions)
      expect(q.options.find((v) => v.id === o.id)?.label).toBe(o.label);
  }
});
it('refuse une ancienne empreinte si le contenu historique a changé au lieu d’écraser silencieusement', () => {
  const id = raw.entries[0].questionId;
  const q = library.flatMap((b) => bookQuestions(b.level, b.id)).find((q) => q.id === id)!;
  expect(() => applyEditorialV15({ ...q, promptFr: q.promptFr + ' modifié' })).toThrow(/périmée/);
});
it('les citations arabes ajoutées aux énoncés sont des fragments exacts de leurs références existantes', () => {
  for (const entry of raw.entries.filter((e) => 'promptFr' in e)) {
    const q = library
      .flatMap((b) => bookQuestions(b.level, b.id))
      .find((q) => q.id === entry.questionId)!;
    for (const match of q.promptFr.matchAll(/«([^»]+)»/g)) {
      const fragment = match[1].trim();
      if (/[\u0600-\u06ff]/.test(fragment))
        expect(q.sources?.some((s) => s.reference?.quoteAr.includes(fragment)) ?? false).toBe(true);
    }
  }
});
it('les choix sont mélangés une seule fois sans toucher aux IDs, au score ni à la banque source', () => {
  const pool = syntheticPool(10);
  const before = structuredClone(pool);
  const first = shuffleAttemptChoices(pool, () => 0);
  const other = shuffleAttemptChoices(pool, () => 0.9999);
  expect(pool).toEqual(before);
  expect(first.map((q) => q.options)).not.toEqual(other.map((q) => q.options));
  for (const q of first) {
    expect(q.correctOptionIds).toEqual(pool.find((v) => v.id === q.id)!.correctOptionIds);
    expect(q.options.map((o) => o.id).sort()).toEqual(
      pool
        .find((v) => v.id === q.id)!
        .options.map((o) => o.id)
        .sort(),
    );
  }
  const answers = Object.fromEntries(first.map((q) => [q.id, q.correctOptionIds]));
  expect(quizScore(first, answers)).toBe(10);
  expect(quizScore(other, answers)).toBe(10);
  answers[first[0].id] = [
    first[0].options.find((o) => !first[0].correctOptionIds.includes(o.id))!.id,
  ];
  expect(quizScore(first, answers)).toBe(9);
});
it('illustre les erreurs proches plutôt que les anciennes réponses hors sujet', () => {
  const pool = library.flatMap((b) => bookQuestions(b.level, b.id));
  expect(
    pool
      .find((q) => q.id === 'moukhtassar-al-akhdari-v13-023')!
      .options.map((o) => o.label)
      .join(' '),
  ).not.toMatch(/sport|repas|lecture/);
  const q = pool.find((q) => q.id === 'moukhtassar-khalil-v13-ia-003')!;
  expect(q.options.map((o) => o.label)).toEqual(
    expect.arrayContaining(['Al-Lakhmî', 'Ibn Yûnus', 'Ibn Rushd', 'Al-Mâzarî']),
  );
});

it('les 610 bonnes réponses, leurs citations et toutes les archives historiques sont inchangées', () => {
  for (const [path, hash] of Object.entries(historicalInputs))
    expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(hash);
  const current = library.flatMap((b) => bookQuestions(b.level, b.id));
  for (const original of originalLiveBank.questions) {
    const q = current.find((q) => q.id === original.id)!;
    expect(q.correctOptionIds).toEqual([original.correctOptionId]);
    expect(q.options.find((o) => o.id === original.correctOptionId)!.label).toBe(
      original.options.find((o) => o.id === original.correctOptionId)!.textFr,
    );
    expect(q.sources?.[0].reference?.quoteAr).toBe(original.references[0].quoteAr);
  }
});
