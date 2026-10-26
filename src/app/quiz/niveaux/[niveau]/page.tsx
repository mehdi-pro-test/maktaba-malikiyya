import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QuizLibrary } from '@/components/quiz-library';
import { quizLevels } from '@/lib/quiz-v12';
import { currentQuizData } from '@/lib/quiz-v12-data';
export const dynamicParams = false;
export const dynamic = 'force-dynamic';
export function generateStaticParams() {
  return quizLevels.map((l) => ({ niveau: l.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ niveau: string }> }) {
  const { niveau } = await params;
  return {
    title: `Quiz · ${quizLevels.find((l) => l.id === niveau)?.label ?? 'Parcours introuvable'}`,
  };
}
export default async function Page({ params }: { params: Promise<{ niveau: string }> }) {
  const { library } = await currentQuizData();
  const { niveau } = await params;
  const level = quizLevels.find((l) => l.id === niveau);
  if (!level) notFound();
  return (
    <section className="section-wrap quiz-library-page">
      <Link className="text-link" href="/quiz/niveaux">
        ← Tous les parcours
      </Link>
      <h1>Parcours {level.label}</h1>
      <QuizLibrary books={library} levelId={niveau} />
    </section>
  );
}
