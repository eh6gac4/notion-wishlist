// 🛒 (cart) を模した SVG をインラインで定義し、PNG にラスタライズして public/ に出力する。
// ローカルで 1 度だけ実行する想定。生成物は git にコミットして、CI / Cloudflare ビルドからは独立させる。
// 外部ネットワークには依存しない。

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = resolve(process.cwd(), "public");
const BG = "#0f172a"; // slate-900
const FG = "#f8fafc"; // slate-50

// 100x100 viewBox の透過 cart icon (Heroicons 風)
function cartSvg({ withBg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
${withBg ? `  <rect width="100" height="100" fill="${BG}"/>\n` : ""}  <g fill="none" stroke="${FG}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 22 L28 22 L36 60 L78 60 L86 32 L32 32"/>
    <circle cx="42" cy="78" r="6"/>
    <circle cx="72" cy="78" r="6"/>
  </g>
</svg>`;
}

async function svgToPng(svg, size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);

  const fg = await sharp(Buffer.from(svg))
    .resize(inner, inner, {
      fit: "contain",
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
  const svgWithBg = cartSvg({ withBg: true });
  const svgTransparent = cartSvg({ withBg: false });

  await writeOut("icon.svg", Buffer.from(svgWithBg));
  await writeOut("icon-192.png", await svgToPng(svgTransparent, 192, 0.1));
  await writeOut("icon-512.png", await svgToPng(svgTransparent, 512, 0.1));
  await writeOut("maskable-icon-512.png", await svgToPng(svgTransparent, 512, 0.2));
  await writeOut("apple-touch-icon.png", await svgToPng(svgTransparent, 180, 0.1));

  console.log("[icons] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
