import references from '@/data/cover-references.json' with { type: 'json' };
export function coverPath(
  productId: string,
  fallback: string,
  adminAsset?: { url: string; usageRightsAttested: boolean; alt: string } | null,
) {
  if (adminAsset?.usageRightsAttested && allowedCoverUrl(adminAsset.url)) return adminAsset.url;
  const asset = references.covers.find((c) => c.productId === productId);
  const path = asset?.realCoverPath as string | null | undefined;
  return asset?.reusePermissionConfirmed &&
    asset.editionVerified &&
    asset.productionUse &&
    path?.startsWith('/images/books/') &&
    !path.includes('..')
    ? path
    : fallback;
}

export function allowedCoverUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      u.hostname === process.env.ADMIN_BLOB_HOST &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(u.hostname) &&
      /^\/covers\/[a-z0-9-]+\.webp$/.test(u.pathname) &&
      !u.search &&
      !u.hash
    );
  } catch {
    return false;
  }
}
