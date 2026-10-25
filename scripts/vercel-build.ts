import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { checkDatabase, DatabaseReadinessError } from '../src/lib/database-readiness';
const setup = process.argv.includes('--setup');
function run(script: string) {
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit', env: process.env });
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
}
try {
  // First production installation only: a completely empty dedicated database can be initialized.
  // Preview builds and future migrations never run automatically.
  const firstProductionInstall =
    !setup && process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production'
      ? (await checkDatabase(process.env.DATABASE_URL, true)) === 'EMPTY'
      : false;
  if (setup || firstProductionInstall) {
    if (process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production')
      throw new DatabaseReadinessError(
        'PREVIEW_SETUP_REFUSED',
        'Initialisation automatique refusée sur une preview. Utilisez une base dédiée et le déploiement Production pour cette opération unique.',
      );
    await checkDatabase(process.env.DATABASE_URL, true);
    run('db:generate');
    run('db:migrate');
    run('db:seed');
  }
  await checkDatabase(process.env.DATABASE_URL);
  console.log('Base PostgreSQL et catalogue vérifiés.');
  run('build');
} catch (error) {
  console.error(
    error instanceof DatabaseReadinessError
      ? `${error.code} : ${error.message}`
      : 'Préparation du site impossible. Aucun secret n’a été journalisé.',
  );
  process.exitCode = 1;
}
