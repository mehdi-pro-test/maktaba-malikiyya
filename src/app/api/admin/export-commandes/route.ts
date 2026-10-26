import { requireOwnerSession, AdminAccessError } from '@/lib/admin/session-core';
import { db } from '@/lib/db';
import { orderFilters } from '@/lib/admin/read';
import { csvCell } from '@/lib/admin/validation';
export async function GET(request: Request) {
  try {
    const actor = await requireOwnerSession(request.headers),
      params = new URL(request.url).searchParams,
      where = orderFilters(Object.fromEntries(params));
    const rows = await db.order.findMany({
      where,
      take: 1000,
      orderBy: { createdAt: 'desc' },
      select: {
        reference: true,
        createdAt: true,
        totalCents: true,
        status: true,
        fulfillmentStatus: true,
        countryCode: true,
        email: true,
      },
    });
    const email = params.get('email') === 'oui';
    await db.adminAuditEvent.create({
      data: {
        actorId: actor.id,
        action: 'orders.export',
        entityType: 'export',
        entityId: crypto.randomUUID(),
        nextSummary: { count: rows.length, emailIncluded: email },
        correlationId: crypto.randomUUID(),
      },
    });
    const lines = [
      [
        'Référence',
        'Date ISO',
        'Total centimes EUR TEST',
        'Paiement',
        'Logistique',
        'Pays',
        ...(email ? ['E-mail'] : []),
      ],
      ...rows.map((r) => [
        r.reference,
        r.createdAt.toISOString(),
        r.totalCents,
        r.status,
        r.fulfillmentStatus,
        r.countryCode,
        ...(email ? [r.email] : []),
      ]),
    ];
    return new Response('\ufeff' + lines.map((row) => row.map(csvCell).join(';')).join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="commandes-test.csv"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Export refusé' },
      {
        status: error instanceof AdminAccessError ? error.status : 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
