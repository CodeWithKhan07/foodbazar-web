// Generates public/icon.png — a 256x256 brown circle with a fork/plate emoji
// Run: node scripts/generate-icon.js
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SIZE = 256;
const cx = SIZE / 2,
  cy = SIZE / 2,
  r = SIZE / 2;

// Colors
const BROWN = [0x41, 0x24, 0x02];
const GOLD = [0xef, 0x9f, 0x27];
const WHITE = [0xff, 0xff, 0xff];

// Raw RGBA scanlines: filter byte(0) + pixels
const raw = Buffer.alloc(SIZE * (1 + SIZE * 4));

for (let y = 0; y < SIZE; y++) {
  raw[y * (1 + SIZE * 4)] = 0; // filter None
  for (let x = 0; x < SIZE; x++) {
    const dx = x - cx,
      dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const off = y * (1 + SIZE * 4) + 1 + x * 4;

    let color, alpha;
    if (dist <= r - 2) {
      // Gold ring at radius 0.82*r
      const ringDist = Math.abs(dist - r * 0.82);
      if (ringDist < r * 0.06) {
        color = GOLD;
        alpha = 255;
      } else if (dist < r * 0.76) {
        // Inner plate — lighter brown
        color = [0x6b, 0x3a, 0x0a];
        alpha = 255;
      } else {
        color = BROWN;
        alpha = 255;
      }
    } else {
      color = BROWN;
      alpha = dist < r + 1 ? Math.round(255 * (r + 1 - dist)) : 0;
    }
    raw[off] = color[0];
    raw[off + 1] = color[1];
    raw[off + 2] = color[2];
    raw[off + 3] = alpha;
  }
}

const compressed = deflateSync(raw);

function crc32(buf) {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = t[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeB = Buffer.from(type);
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcIn = Buffer.concat([typeB, data]);
  const crcB = Buffer.allocUnsafe(4);
  crcB.writeUInt32BE(crc32(crcIn));
  return Buffer.concat([len, typeB, data, crcB]);
}

const ihdr = Buffer.allocUnsafe(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 6; // 8-bit RGBA
ihdr[10] = ihdr[11] = ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", compressed),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(__dirname, "../public/icon.png");
writeFileSync(out, png);
console.log("Created", out);
