// Apple の起動スプラッシュ画像（public/splash/apple-splash-<W>-<H>.png）を再生成する。
// 既存ファイル名から寸法一覧を読み取り、同じ寸法だけを作り直す（増減させない —
// components/AppleSplashScreens.tsx の <link media> と一対一で対応しているため）。
// 背景を単色 + 中央にドット絵カートを配置するだけのシンプルな構成。
// ローカルで 1 度だけ実行する想定。外部ネットワークには依存しない。

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { BG, glyphToSvg, loadGlyph } from "./lib/pixel-svg.mjs";

const SPLASH_DIR = resolve(process.cwd(), "public/splash");
const LOGO_RATIO = 0.4; // 短辺に対するロゴ幅の比率

const SPLASH_NAME_RE = /^apple-splash-(\d+)-(\d+)\.png$/;

async function findSplashSizes() {
  const files = await readdir(SPLASH_DIR);
  return files
    .map((name) => {
      const m = name.match(SPLASH_NAME_RE);
      if (!m) return null;
      return { name, width: Number(m[1]), height: Number(m[2]) };
    })
    .filter((x) => x !== null);
}

async function buildSplash(logoSvg, width, height) {
  const logoSize = Math.round(Math.min(width, height) * LOGO_RATIO);
  const logo = await sharp(Buffer.from(logoSvg))
    .resize(logoSize, logoSize, { kernel: "nearest" })
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 4, background: BG },
  })
    .composite([
      {
        input: logo,
        top: Math.round((height - logoSize) / 2),
        left: Math.round((width - logoSize) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  const cartRows = await loadGlyph("cart");
  const svg = glyphToSvg(cartRows);
  const sizes = await findSplashSizes();

  await mkdir(SPLASH_DIR, { recursive: true });
  await Promise.all(
    sizes.map(async ({ name, width, height }) => {
      const buf = await buildSplash(svg, width, height);
      await writeFile(resolve(SPLASH_DIR, name), buf);
      console.log(`  wrote ${name} (${buf.byteLength} bytes)`);
    })
  );

  console.log(`[splash] done (${sizes.length} files)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
