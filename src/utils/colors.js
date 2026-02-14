import { hashCode } from "./format";

const PALETTE = [
  { a: "#0EA5E9", b: "#1D4ED8" },
  { a: "#22C55E", b: "#065F46" },
  { a: "#F59E0B", b: "#B45309" },
  { a: "#A855F7", b: "#6D28D9" },
  { a: "#FB7185", b: "#BE123C" },
  { a: "#14B8A6", b: "#0F766E" },
  { a: "#60A5FA", b: "#1E3A8A" },
  { a: "#F97316", b: "#9A3412" },
];

export function pickPalette(key) {
  return PALETTE[hashCode(String(key || "")) % PALETTE.length];
}

export function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return { r: 255, g: 255, b: 255 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
