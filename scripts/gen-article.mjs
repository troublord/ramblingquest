import { writeFile } from 'fs/promises';
import { join } from 'path';

const ROOMS = ['study', 'bar', 'workshop', 'court'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randCJK(len) {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += String.fromCodePoint(0x4E00 + Math.floor(Math.random() * (0x9FFF - 0x4E00)));
  }
  return result;
}

function randSentence() {
  return randCJK(randInt(10, 30)) + '。';
}

function randParagraph() {
  const sentences = randInt(1, 4);
  return Array.from({ length: sentences }, randSentence).join('');
}

function randBody() {
  const paragraphs = randInt(3, 6);
  return Array.from({ length: paragraphs }, randParagraph).join('\n\n');
}

const now = Date.now();
const slug = `test-${now}`;
const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
const today = new Date().toISOString().slice(0, 10);
const title = randCJK(randInt(8, 14));
const description = randCJK(randInt(20, 50));
const body = randBody();

const content = `---
title: '${title}'
description: '${description}'
pubDate: '${today}'
room: '${room}'
---

${body}
`;

const outPath = join('src', 'content', 'blog', `${slug}.md`);
await writeFile(outPath, content, 'utf8');
console.log(`產生：${outPath}  [room: ${room}]`);
