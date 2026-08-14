import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist', import.meta.url).pathname;
const assetsDir = join(distDir, 'assets');
const files = readdirSync(assetsDir);

const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));

let css = readFileSync(join(assetsDir, cssFile), 'utf-8');

// Keep only latin / latin-ext font-face blocks (drop cyrillic/devanagari to shrink size),
// and inline the woff2 src as a base64 data URI (drop the woff fallback).
const fontFaceRe = /@font-face\{[^}]*\}/g;
css = css.replace(fontFaceRe, (block) => {
  const isUnwanted = /-(cyrillic|devanagari)/.test(block);
  if (isUnwanted) return '';
  const urlMatch = block.match(/url\((\/assets\/([^)]+\.woff2))\)format\("woff2"\)/);
  if (!urlMatch) return block;
  const fileName = urlMatch[2];
  const fontData = readFileSync(join(assetsDir, fileName));
  const b64 = fontData.toString('base64');
  const dataUri = `data:font/woff2;base64,${b64}`;
  // Replace the whole src:...; segment with just the woff2 data URI (drop woff fallback)
  return block.replace(/src:url\([^;]*;/, `src:url(${dataUri})format("woff2");`);
});

const js = readFileSync(join(assetsDir, jsFile), 'utf-8');

const html = `<meta charset="utf-8">
<title>Bucketlist</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

const outPath = new URL('../artifact-bucketlist.html', import.meta.url).pathname;
writeFileSync(outPath, html);
console.log('wrote', outPath, (html.length / 1024).toFixed(1) + ' KB');
