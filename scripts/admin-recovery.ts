import { hashPassword } from 'better-auth/crypto';
import 'dotenv/config';
import { db } from '../src/lib/db';
import { adminConfig } from '../src/lib/admin/config';
const resetPassword = process.argv.includes('--reset-password');
const reset = process.argv.includes('--reset-mfa'),
  revoke = process.argv.includes('--revoke-sessions');
if (!process.argv.includes('--confirm-owner-recovery') || (!reset && !revoke && !resetPassword))
  throw new Error('Procédure privée : choix explicite et --confirm-owner-recovery requis.');
try {
  const config = adminConfig(),
    owner = await db.user.findUniqueOrThrow({ where: { email: config.email } });
  const replacement = process.env.ADMIN_RECOVERY_PASSWORD;
  if (resetPassword && (!replacement || replacement.length < 14 || replacement.length > 128))
    throw new Error('ADMIN_RECOVERY_PASSWORD doit être configuré hors Git (14 à 128 caractères).');
  const hashed = resetPassword ? await hashPassword(replacement!) : null;
  await db.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId: owner.id } });
    await tx.verification.deleteMany({});
    if (hashed) {
      const changed = await tx.account.updateMany({
        where: { userId: owner.id, providerId: 'credential' },
        data: { password: hashed },
      });
      if (changed.count !== 1)
        throw new Error('Compte propriétaire incohérent. Aucune modification confirmée.');
    }
    if (reset) {
      await tx.twoFactor.deleteMany({ where: { userId: owner.id } });
      await tx.user.update({ where: { id: owner.id }, data: { twoFactorEnabled: false } });
    }
    await tx.adminAuditEvent.create({
      data: {
        actorId: owner.id,
        action: resetPassword
          ? 'auth.recovery-reset-password'
          : reset
            ? 'auth.recovery-reset-mfa'
            : 'auth.recovery-revoke',
        entityType: 'owner',
        entityId: owner.id,
        reason: 'Procédure CLI privée explicitement confirmée',
        correlationId: crypto.randomUUID(),
      },
    });
  });
  console.log(
    'Sessions révoquées.',
    reset ? 'Un nouvel enrôlement TOTP sera obligatoire avant accès aux données privées.' : '',
  );
} finally {
  await db.$disconnect();
}
