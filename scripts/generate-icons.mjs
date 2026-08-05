// ドット絵カート（lib/pixel-glyphs.json の "cart"）を SVG 化し、PNG にラスタライズして
// public/ に出力する。ローカルで 1 度だけ実行する想定。生成物は git にコミットして、
// CI / Cloudflare ビルドからは独立させる。外部ネットワークには依存しない。

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import sharp from "sharp";
import { BG, glyphToSvg, loadGlyph } from "./lib/pixel-svg.mjs";

const PUBLIC_DIR = resolve(process.cwd(), "public");

async function svgToPng(svg, size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);

  const fg = await sharp(Buffer.from(svg), { density: 72 })
    .resize(inner, inner, {
      fit: "contain",
      kernel: "nearest",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: fg, top: offset, left: offset }])
    .png()
    .toBuffer();
}

async function writeOut(name, buf) {
  const out = resolve(PUBLIC_DIR, name);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, buf);
  console.log(`  wrote ${out} (${buf.byteLength} bytes)`);
}

async function main() {
  const cartRows = await loadGlyph("cart");
  const svgWithBg = glyphToSvg(cartRows, { withBg: true });
  const svgTransparent = glyphToSvg(cartRows);

  await writeOut("icon.svg", Buffer.from(svgWithBg));
  await Promise.all([
    svgToPng(svgTransparent, 192, 0.1).then((buf) => writeOut("icon-192.png", buf)),
    svgToPng(svgTransparent, 512, 0.1).then((buf) => writeOut("icon-512.png", buf)),
    svgToPng(svgTransparent, 512, 0.2).then((buf) => writeOut("maskable-icon-512.png", buf)),
    svgToPng(svgTransparent, 180, 0.1).then((buf) => writeOut("apple-touch-icon.png", buf)),
  ]);

  console.log("[icons] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
