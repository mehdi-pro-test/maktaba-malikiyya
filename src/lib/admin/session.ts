import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ownerIdentity as identity,
  requireOwnerSession as requireSession,
  AdminAccessError,
} from './session-core';
export { AdminAccessError };
export async function ownerIdentity(requestHeaders?: Headers) {
  return identity(requestHeaders ?? (await headers()));
}
export async function requireOwnerSession(requestHeaders?: Headers) {
  return requireSession(requestHeaders ?? (await headers()));
}
export async function requireOwnerPage() {
  try {
    return await requireOwnerSession();
  } catch (error) {
    if (error instanceof AdminAccessError) redirect('/admin/connexion');
    throw error;
  }
}
