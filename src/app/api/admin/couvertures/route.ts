import { limitedBytes } from '@/lib/admin/http';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireOwnerSession, AdminAccessError } from '@/lib/admin/session-core';
import { assertSameOrigin, AdminOriginError } from '@/lib/admin/config';
import { uploadCover } from '@/lib/admin/covers';
import { AdminConflict } from '@/lib/admin/mutations';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const actor = await requireOwnerSession(request.headers);
    assertSameOrigin(request.headers);
    if (Number(request.headers.get('content-length') ?? 0) > 4 * 1024 * 1024)
      return Response.json({ error: 'Image trop volumineuse' }, { status: 413 });
    const bytes = await limitedBytes(request, 4 * 1024 * 1024);
    const data = await new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: bytes,
      }).formData(),
      file = data.get('file');
    if (!(file instanceof File)) throw new Error('Fichier requis');
    const input = z
      .object({
        productId: z.string().min(1).max(160),
        version: z.coerce.number().int().min(0),
        alt: z.string().min(3).max(300),
        rights: z.literal('on'),
      })
      .parse(
        Object.fromEntries(['productId', 'version', 'alt', 'rights'].map((k) => [k, data.get(k)])),
      );
    await uploadCover(actor, { ...input, rights: true, file });
    revalidatePath('/livres', 'layout');
    revalidatePath('/admin/catalogue', 'layout');
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof AdminAccessError
            ? 'Session absente ou expirée. Reconnectez-vous.'
            : error instanceof AdminConflict
              ? error.message
              : 'Téléversement refusé. Vérifiez le format, les droits et la configuration.',
      },
      {
        status:
          error instanceof AdminAccessError
            ? error.status
            : error instanceof AdminOriginError
              ? 403
              : error instanceof RangeError
                ? 413
                : 400,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
