import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';

const publicDir = './public';
const SOURCE_EXTS = ['.png', '.jpg', '.jpeg'];
const clean = process.argv.includes('--clean');

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectImages(fullPath));
    } else if (SOURCE_EXTS.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

const images = await collectImages(publicDir);

if (images.length === 0) {
  console.log('沒有需要轉換的圖片。');
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const input of images) {
  const dir = input.substring(0, input.lastIndexOf('\\') + 1) || input.substring(0, input.lastIndexOf('/') + 1);
  const webpName = basename(input, extname(input)) + '.webp';
  const output = join(dir, webpName);

  let exists = false;
  try { await stat(output); exists = true; } catch {}

  const relInput = input.replace(/^\.[\\/]/, '');
  if (exists) {
    console.log(`跳過 ${relInput.padEnd(40)} （.webp 已存在）`);
    skipped++;
    continue;
  }

  const before = (await stat(input)).size;
  await sharp(input).webp({ quality: 85 }).toFile(output);
  const after = (await stat(output)).size;
  const saved = Math.round((1 - after / before) * 100);
  console.log(`轉換 ${relInput.padEnd(40)} ${(before / 1024).toFixed(0).padStart(6)} KB → ${(after / 1024).toFixed(0).padStart(6)} KB  (-${saved}%)`);
  if (clean) await unlink(input);
  converted++;
}

console.log(`\n完成：轉換 ${converted} 個，跳過 ${skipped} 個。`);
