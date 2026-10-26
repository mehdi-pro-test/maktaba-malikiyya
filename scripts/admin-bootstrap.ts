import 'dotenv/config';
import { createOwnerAuth } from '../src/lib/admin/auth';
import { db } from '../src/lib/db';
import { adminConfig } from '../src/lib/admin/config';
if (!process.argv.includes('--confirm-bootstrap'))
  throw new Error('Usage privé : --confirm-bootstrap requis.');
const config = adminConfig();
try {
  if (await db.user.count())
    throw new Error('Le propriétaire existe déjà. Aucun second compte créé.');
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password || password.length < 14)
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD doit être défini hors Git (14 caractères minimum).');
  const auth = createOwnerAuth(true);
  const result = await auth.api.signUpEmail({
    body: { email: config.email, password, name: 'Propriétaire' },
    headers: new Headers({ origin: config.url }),
  });
  // Never print password, session, cookie or setup URI.
  await db.session.deleteMany({ where: { userId: result.user.id } });
  console.log(
    'Propriétaire créé. Identifiant stable à configurer dans ADMIN_USER_ID :',
    result.user.id,
  );
  console.log(
    'Retirez ADMIN_BOOTSTRAP_PASSWORD puis connectez-vous et activez le TOTP. Aucun accès métier avant vérification MFA.',
  );
} finally {
  await db.$disconnect();
}
