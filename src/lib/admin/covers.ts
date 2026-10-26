import 'server-only';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { allowedCoverUrl } from '../media';
import { audit, AdminConflict, type OwnerActor } from './mutations';
export function coverStorageReady() {
  return (
    !!process.env.BLOB_READ_WRITE_TOKEN &&
    /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(process.env.ADMIN_BLOB_HOST ?? '')
  );
}
export async function sanitizeCover(file: File) {
  if (file.size > 3 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new AdminConflict('Image PNG, JPEG ou WebP de 3 Mo maximum requise.');
  const buffer = Buffer.from(await file.arrayBuffer());
  const magic = buffer.subarray(0, 12);
  const format = magic.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? 'image/png'
    : magic[0] === 255 && magic[1] === 216 && magic[2] === 255
      ? 'image/jpeg'
      : magic.toString('ascii', 0, 4) === 'RIFF' && magic.toString('ascii', 8, 12) === 'WEBP'
        ? 'image/webp'
        : null;
  if (
    format === 'image/png' &&
    !buffer.subarray(-12).equals(Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]))
  )
    throw new AdminConflict('Contenu ajouté après la fin de l’image.');
  if (format === 'image/jpeg' && !(buffer.at(-2) === 255 && buffer.at(-1) === 217))
    throw new AdminConflict('Fin JPEG invalide');
  if (format === 'image/webp' && buffer.readUInt32LE(4) + 8 !== buffer.length)
    throw new AdminConflict('Taille WebP incohérente');
  if (format !== file.type)
    throw new AdminConflict('Le contenu ne correspond pas au format déclaré.');
  const image = sharp(buffer, { limitInputPixels: 25000000, animated: false, failOn: 'warning' });
  const metadata = await image.metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 10 ||
    metadata.height < 10 ||
    (metadata.pages ?? 1) > 1
  )
    throw new AdminConflict('Dimensions ou image animée non autorisées.');
  const output = await image
    .rotate()
    .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: output.data, width: output.info.width, height: output.info.height };
}
export async function uploadCover(
  actor: OwnerActor,
  input: { productId: string; version: number; alt: string; rights: boolean; file: File },
) {
  if (!coverStorageReady())
    throw new AdminConflict('Stockage persistant non configuré. Aucun fichier enregistré.');
  if (!input.rights || input.alt.trim().length < 3 || input.alt.length > 300)
    throw new AdminConflict('Droits de réutilisation et texte alternatif requis.');
  const product = await db.product.findUniqueOrThrow({ where: { id: input.productId } });
  if (product.version !== input.version) throw new AdminConflict('Livre modifié. Actualisez.');
  const quota = await db.productCoverAsset.aggregate({ _sum: { bytes: true } });
  if (
    (quota._sum.bytes ?? 0) + input.file.size > 250 * 1024 * 1024 ||
    (await db.productCoverAsset.count({ where: { productId: product.id } })) >= 50
  )
    throw new AdminConflict(
      'Quota de couvertures atteint. Examinez les versions conservées avant un nouvel ajout.',
    );
  const clean = await sanitizeCover(input.file),
    key = `covers/${randomUUID()}.webp`;
  const object = await put(key, clean.buffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: 'image/webp',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!allowedCoverUrl(object.url)) throw new AdminConflict('Stockage hors du domaine autorisé.');
  return db.$transaction(async (tx) => {
    const asset = await tx.productCoverAsset.create({
      data: {
        productId: product.id,
        storageKey: key,
        url: object.url,
        mime: 'image/webp',
        bytes: clean.buffer.length,
        width: clean.width,
        height: clean.height,
        alt: input.alt.trim(),
        usageRightsAttested: true,
        adminId: actor.id,
      },
    });
    const changed = await tx.product.updateMany({
      where: { id: product.id, version: input.version },
      data: { coverAssetId: asset.id, version: { increment: 1 } },
    });
    if (changed.count !== 1)
      throw new AdminConflict('Livre modifié pendant le téléversement. Actualisez.');
    await audit(
      tx,
      actor,
      'product.cover',
      'product',
      product.id,
      { coverAssetId: product.coverAssetId },
      { coverAssetId: asset.id },
      'Couverture téléversée avec droits déclarés',
    );
    return asset.id;
  });
}
export async function selectCover(
  actor: OwnerActor,
  productId: string,
  assetId: string,
  version: number,
) {
  return db.$transaction(async (tx) => {
    const p = await tx.product.findUniqueOrThrow({ where: { id: productId } }),
      asset = await tx.productCoverAsset.findUniqueOrThrow({ where: { id: assetId } });
    if (asset.productId !== p.id || !asset.usageRightsAttested || !allowedCoverUrl(asset.url))
      throw new AdminConflict('Couverture non autorisée');
    const result = await tx.product.updateMany({
      where: { id: p.id, version },
      data: { coverAssetId: asset.id, version: { increment: 1 } },
    });
    if (result.count !== 1) throw new AdminConflict('Livre modifié');
    await audit(
      tx,
      actor,
      'product.restore-cover',
      'product',
      p.id,
      { coverAssetId: p.coverAssetId },
      { coverAssetId: asset.id },
      'Restauration de couverture',
    );
  });
}
