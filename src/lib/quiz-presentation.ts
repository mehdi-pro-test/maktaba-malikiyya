import type { QuizQuestion } from './quiz';
// Original editorial imports remain immutable. Only obsolete workflow instructions
// are separated from the explanation shown for an already published question.
const workflowNotices = [
  "La réponse correspond à cette formulation; elle doit être relue avec l'édition de référence avant publication.",
  'Cette formulation justifie la réponse retenue; elle reste soumise à une collation avec une édition fiable et à une revue humaine.',
  "La réponse s'appuie sur cette formulation, sous réserve de collation éditoriale et de relecture spécialisée avant publication.",
  'Une collation et une relecture doctrinale sont exigées avant publication.',
];
export function questionPresentation(question: QuizQuestion) {
  const notice = workflowNotices.find((text) => question.explanationFr.endsWith(text));
  return {
    explanation: notice
      ? question.explanationFr.slice(0, -notice.length).trimEnd()
      : question.explanationFr,
    editorialNotice: notice
      ? 'Question publiée après validation déclarée par le propriétaire. Cette validation ne constitue pas une certification indépendante des citations et des attributions.'
      : undefined,
  };
}
