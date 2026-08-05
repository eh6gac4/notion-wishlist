// lib/pixel-glyphs.json のドットマップを SVG に変換する共通処理。
// generate-icons.mjs / generate-splash.mjs の両方から使う。

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const BG = "#101010"; // fc-ink
export const FG = "#FCFCFC"; // fc-paper
export const WHEEL = "#F83800"; // fc-red
const WHEEL_ROW_START = 11; // cart グリフの車輪部分（11〜14行目）だけ赤で塗る

export async function loadGlyph(name) {
  const json = JSON.parse(
    await readFile(resolve(process.cwd(), "lib/pixel-glyphs.json"), "utf8")
  );
  return json[name];
}

// ドットマップを viewBox=0 0 n n の <rect> 集合に変換する。cart グリフは車輪だけ別色。
export function glyphToSvg(rows, { withBg = false } = {}) {
  const n = rows.length;
  const rects = rows.flatMap((row, y) =>
    [...row].map((c, x) => {
      if (c !== "#") return "";
      const fill = y >= WHEEL_ROW_START ? WHEEL : FG;
      return `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`;
    })
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shapeRendering="crispEdges">
${withBg ? `  <rect width="${n}" height="${n}" fill="${BG}"/>\n` : ""}  ${rects}
</svg>`;
}
