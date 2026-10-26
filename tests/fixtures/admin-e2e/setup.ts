import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { adminE2EConfig, adminE2EEnv } from './environment';
export default async function setup() {
  const config = adminE2EConfig();
  await promisify(execFile)(
    process.execPath,
    ['--conditions=react-server', '--import', 'tsx', 'scripts/admin-e2e-bootstrap.ts'],
    { cwd: process.cwd(), env: { ...process.env, ...adminE2EEnv(config) }, timeout: 90000 },
  );
}
