import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const publicDir = './public';
const SOURCE_EXTS = ['.png', '.jpg', '.jpeg'];

const files = await readdir(publicDir);
const images = files.filter(f => SOURCE_EXTS.includes(extname(f).toLowerCase()) && !f.startsWith('_'));

if (images.length === 0) {
  console.log('沒有需要轉換的圖片。');
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const file of images) {
  const webpName = basename(file, extname(file)) + '.webp';
  const input = join(publicDir, file);
  const output = join(publicDir, webpName);

  const alreadyExists = files.includes(webpName);
  if (alreadyExists) {
    console.log(`跳過 ${file.padEnd(25)} （${webpName} 已存在）`);
    skipped++;
    continue;
  }

  const before = (await stat(input)).size;
  await sharp(input).webp({ quality: 85 }).toFile(output);
  const after = (await stat(output)).size;
  const saved = Math.round((1 - after / before) * 100);
  console.log(`轉換 ${file.padEnd(25)} ${(before / 1024).toFixed(0).padStart(6)} KB → ${(after / 1024).toFixed(0).padStart(6)} KB  (-${saved}%)`);
  converted++;
}

console.log(`\n完成：轉換 ${converted} 個，跳過 ${skipped} 個。`);
