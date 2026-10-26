import { Prisma } from '@prisma/client';
import { limitedText } from '@/lib/admin/http';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireOwnerSession, AdminAccessError } from '@/lib/admin/session-core';
import { assertSameOrigin, AdminOriginError } from '@/lib/admin/config';
import {
  adjustStock,
  fulfillOrder,
  saveProduct,
  adoptCatalogDraft,
  AdminConflict,
  audit,
} from '@/lib/admin/mutations';
import {
  saveQuizDraft,
  publishQuizRevision,
  archiveQuizQuestion,
  restoreHistoricalQuiz,
} from '@/lib/admin/quiz';
import { selectCover } from '@/lib/admin/covers';
import { db } from '@/lib/db';
import { id } from '@/lib/admin/validation';
export async function POST(request: Request) {
  try {
    const actor = await requireOwnerSession(request.headers);
    assertSameOrigin(request.headers);
    const body = await limitedText(request, 60000);
    const { command, input } = z
      .object({
        command: z.enum([
          'stock',
          'fulfillment',
          'product',
          'adopt-draft',
          'quiz-save',
          'quiz-publish',
          'quiz-archive',
          'quiz-baseline',
          'restore-cover',
          'revoke-sessions',
        ]),
        input: z.unknown(),
      })
      .strict()
      .parse(JSON.parse(body));
    let result: unknown;
    switch (command) {
      case 'stock':
        result = await adjustStock(actor, input);
        break;
      case 'fulfillment':
        result = await fulfillOrder(actor, input);
        break;
      case 'product':
        result = await saveProduct(actor, input);
        break;
      case 'adopt-draft': {
        const data = z
          .object({ id, confirmed: z.literal(true) })
          .strict()
          .parse(input);
        result = await adoptCatalogDraft(actor, data.id);
        break;
      }
      case 'quiz-save':
        result = await saveQuizDraft(actor, input);
        break;
      case 'quiz-publish':
        result = await publishQuizRevision(actor, input);
        break;
      case 'quiz-baseline':
        result = await restoreHistoricalQuiz(actor, input);
        break;
      case 'quiz-archive':
        result = await archiveQuizQuestion(actor, input);
        break;
      case 'restore-cover': {
        const data = z
          .object({
            productId: id,
            assetId: id,
            version: z.number().int().min(0),
            confirmed: z.literal(true),
          })
          .strict()
          .parse(input);
        await selectCover(actor, data.productId, data.assetId, data.version);
        break;
      }
      case 'revoke-sessions': {
        z.object({ confirmed: z.literal(true) })
          .strict()
          .parse(input);
        await db.$transaction(async (tx) => {
          await tx.session.deleteMany({ where: { userId: actor.id } });
          await audit(
            tx,
            actor,
            'auth.revoke-all',
            'owner',
            actor.id,
            undefined,
            undefined,
            'Révocation explicite des sessions',
          );
        });
        break;
      }
    }
    for (const path of ['/', '/livres', '/quiz/niveaux', '/quiz/aleatoire', '/admin'])
      revalidatePath(path, 'layout');
    return Response.json(
      { ok: true, id: typeof result === 'string' ? result : undefined },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    const duplicate =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
    const missing = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
    const status = duplicate
      ? 409
      : missing
        ? 404
        : error instanceof AdminOriginError
          ? 403
          : error instanceof RangeError
            ? 413
            : error instanceof AdminAccessError
              ? error.status
              : error instanceof AdminConflict
                ? 409
                : error instanceof z.ZodError || error instanceof SyntaxError
                  ? 400
                  : 500;
    return Response.json(
      {
        error: duplicate
          ? 'Ce lien ou identifiant existe déjà. Recherchez l’élément avant de recommencer.'
          : missing
            ? 'Élément introuvable. Actualisez la liste.'
            : error instanceof AdminAccessError
              ? 'Votre session n’autorise plus cette action. Reconnectez-vous.'
              : error instanceof AdminConflict
                ? error.message
                : error instanceof z.ZodError
                  ? 'Champs invalides : ' +
                    error.issues
                      .map((i) => i.message)
                      .slice(0, 3)
                      .join(' · ')
                  : status === 500
                    ? 'Écriture impossible. Aucune réussite confirmée ; vérifiez les données et réessayez.'
                    : 'Accès ou requête refusé.',
      },
      { status, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
