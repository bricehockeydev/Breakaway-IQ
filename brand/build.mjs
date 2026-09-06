// Renders the Breakaway IQ logo SVGs to PNGs for social / general use.
//   node brand/build.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const D = 384; // svg render density

async function svgToPng(src, out, size) {
  await sharp(src, { density: D }).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out);
  console.log("  " + out);
}

async function wordmark(src, out, width) {
  await sharp(src, { density: D }).resize({ width }).png().toFile(out);
  console.log("  " + out);
}

console.log("icons:");
await svgToPng("brand/breakaway-iq-icon.svg", "brand/breakaway-iq-avatar-1080.png", 1080);
await svgToPng("brand/breakaway-iq-icon.svg", "brand/breakaway-iq-icon-512.png", 512);
await svgToPng("brand/breakaway-iq-icon.svg", "brand/breakaway-iq-icon-180.png", 180);
await svgToPng("brand/breakaway-iq-icon-light.svg", "brand/breakaway-iq-icon-light-1080.png", 1080);

console.log("wordmarks:");
await wordmark("brand/breakaway-iq-wordmark.svg", "brand/breakaway-iq-wordmark-navy.png", 1800);
await wordmark("brand/breakaway-iq-wordmark-white.svg", "brand/breakaway-iq-wordmark-white.png", 1800);

// Horizontal lockup: white mark (no square) + white wordmark on transparent
console.log("lockup + banner:");
const iconBuf = await sharp("brand/breakaway-iq-mark-white.svg", { density: D }).resize(300, 300).png().toBuffer();
const wmBuf = await sharp("brand/breakaway-iq-wordmark-white.svg", { density: D }).resize({ height: 150 }).png().toBuffer();
const wmMeta = await sharp(wmBuf).metadata();

const lockupW = 300 + 24 + wmMeta.width + 10;
await sharp({ create: { width: lockupW, height: 300, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([
    { input: iconBuf, left: 0, top: 0 },
    { input: wmBuf, left: 324, top: Math.round((300 - wmMeta.height) / 2) },
  ])
  .png()
  .toFile("brand/breakaway-iq-lockup.png");
console.log("  brand/breakaway-iq-lockup.png");

// IG / banner: 1500x500 navy with the lockup centered
const lockupBuf = await readFile("brand/breakaway-iq-lockup.png");
const lockupMeta = await sharp(lockupBuf).metadata();
const scale = Math.min(1000 / lockupMeta.width, 260 / lockupMeta.height);
const scaledLockup = await sharp(lockupBuf).resize({ width: Math.round(lockupMeta.width * scale) }).png().toBuffer();
const slMeta = await sharp(scaledLockup).metadata();
await sharp({ create: { width: 1500, height: 500, channels: 4, background: { r: 10, g: 37, b: 64, alpha: 1 } } })
  .composite([{ input: scaledLockup, left: Math.round((1500 - slMeta.width) / 2), top: Math.round((500 - slMeta.height) / 2) }])
  .png()
  .toFile("brand/breakaway-iq-banner-1500x500.png");
console.log("  brand/breakaway-iq-banner-1500x500.png");

// Square 1080 post — navy, centered lockup
const sq = await sharp(lockupBuf).resize({ width: 900 }).png().toBuffer();
const sqMeta = await sharp(sq).metadata();
await sharp({ create: { width: 1080, height: 1080, channels: 4, background: { r: 10, g: 37, b: 64, alpha: 1 } } })
  .composite([{ input: sq, left: Math.round((1080 - sqMeta.width) / 2), top: Math.round((1080 - sqMeta.height) / 2) }])
  .png()
  .toFile("brand/breakaway-iq-square-1080.png");
console.log("  brand/breakaway-iq-square-1080.png");

console.log("done");
