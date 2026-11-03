import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, isAbsolute } from 'node:path';
import { gunzipSync } from 'node:zlib';

const sourceDir = join(process.cwd(), 'source');
const parts = readdirSync(sourceDir).filter(name => /^bundle-\d+\.b64$/.test(name)).sort();
if (!parts.length) throw new Error('Doit source bundle is missing.');
const packed = Buffer.from(parts.map(name => readFileSync(join(sourceDir, name), 'utf8').trim()).join(''), 'base64');
const tar = gunzipSync(packed);
let offset = 0;
let restored = 0;
while (offset + 512 <= tar.length) {
  const header = tar.subarray(offset, offset + 512);
  if (header.every(byte => byte === 0)) break;
  const readText = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '').trim();
  const name = readText(0, 100);
  const prefix = readText(345, 155);
  const path = normalize(prefix ? `${prefix}/${name}` : name);
  const size = Number.parseInt(readText(124, 12) || '0', 8);
  const type = readText(156, 1);
  const dataStart = offset + 512;
  if (path && !isAbsolute(path) && path !== '..' && !path.startsWith(`..${process.platform === 'win32' ? '\\\\' : '/'}`) && (type === '' || type === '0')) {
    const target = join(process.cwd(), path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, tar.subarray(dataStart, dataStart + size));
    restored++;
  }
  offset = dataStart + Math.ceil(size / 512) * 512;
}
if (!restored) throw new Error('Doit source bundle had no files to restore.');
console.log(`Restored ${restored} Doit source files.`);
