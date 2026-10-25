import { Client } from 'pg';
export class DatabaseReadinessError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export const shopTables = [
  'Category',
  'CatalogDraft',
  'Product',
  'Order',
  'OrderItem',
  'StockReservation',
  'WebhookEvent',
  'EmailDelivery',
  '_MaktabaMigration',
];
export function databaseConnection(value: string | undefined) {
  if (!value)
    throw new DatabaseReadinessError(
      'DATABASE_URL_MISSING',
      'Aucune base connectée : connectez une nouvelle base PostgreSQL (par exemple Neon) à ce projet Vercel pour définir DATABASE_URL.',
    );
  try {
    const url = new URL(value);
    if (!['postgresql:', 'postgres:'].includes(url.protocol)) throw new Error();
  } catch {
    throw new DatabaseReadinessError(
      'DATABASE_URL_INVALID',
      'DATABASE_URL doit être une URL PostgreSQL valide. Ne publiez pas sa valeur dans les logs ou dans Git.',
    );
  }
  return value;
}
export async function checkDatabase(connectionString: string | undefined, bootstrap = false) {
  const client = new Client({
    connectionString: databaseConnection(connectionString),
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
  });
  try {
    await client.connect();
    const tables = await client.query<{ tablename: string }>(
      'SELECT tablename FROM pg_tables WHERE schemaname = current_schema()',
    );
    const names = tables.rows.map((t) => t.tablename);
    if (bootstrap) {
      if (names.some((name) => !shopTables.includes(name)))
        throw new DatabaseReadinessError(
          'DATABASE_NOT_DEDICATED',
          'Initialisation refusée : cette base contient des tables étrangères à Maktaba. Connectez une nouvelle base dédiée.',
        );
      return names.length === 0 ? ('EMPTY' as const) : ('EXISTING' as const);
    }
    if (shopTables.some((name) => !names.includes(name)))
      throw new DatabaseReadinessError(
        'DATABASE_SCHEMA_MISSING',
        'La base est connectée mais les tables manquent. Sur la nouvelle base dédiée, effectuez une fois npm run vercel:setup, puis rétablissez npm run vercel:build.',
      );
    const categoryColumn = await client.query(
      "SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='Product' AND column_name='categoryId'",
    );
    if (!categoryColumn.rowCount)
      throw new DatabaseReadinessError(
        'DATABASE_SCHEMA_MISSING',
        'La migration V1.1 manque. Sauvegardez la base dédiée puis appliquez npm run db:migrate avant de déployer. Aucune migration automatique des données existantes n’est exécutée.',
      );
    const active = await client.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM "Product" WHERE active = true',
    );
    if (!active.rows[0].count)
      throw new DatabaseReadinessError(
        'CATALOG_EMPTY',
        'Les tables sont disponibles mais le catalogue est vide. Initialisez les deux livres avec npm run db:seed.',
      );
  } catch (error) {
    if (error instanceof DatabaseReadinessError) throw error;
    throw new DatabaseReadinessError(
      'DATABASE_UNREACHABLE',
      'Connexion PostgreSQL impossible. Vérifiez DATABASE_URL, les droits et la disponibilité de la base dans Vercel.',
    );
  } finally {
    await client.end().catch(() => {});
  }
}
