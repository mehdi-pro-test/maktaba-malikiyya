import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import old from '../docs/v1.4-admin/HISTORICAL-MIGRATIONS-SHA256.json';
import manifest from '../docs/v1.4-admin/source/MANIFEST.json';
it('préserve les migrations historiques et le pack documentaire livré', () => {
  for (const [path, hash] of Object.entries(old))
    expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(hash);
  for (const item of manifest.files) {
    const data = readFileSync('docs/v1.4-admin/source/' + item.path);
    expect(data.length).toBe(item.bytes);
    expect(createHash('sha256').update(data).digest('hex')).toBe(item.sha256);
  }
});
