import references from '@/data/cover-references.json';
export function coverPath(productId: string, fallback: string) {
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
