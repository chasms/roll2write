// Utility functions for deterministic dice appearance (rotation) and pattern backgrounds.
import type { DieDefinition, DiePattern } from "../domain/types";

export function hashAngle(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const fullAngle = Math.abs(hash) % 360;
  return Math.round(fullAngle / 15) * 15; // snap to 15-deg increments
}

export function polygonPoints(sides: number, radius = 48): string {
  const limited = Math.min(Math.max(sides, 3), 48);
  const points: string[] = [];
  const angleStep = (Math.PI * 2) / limited;
  const rotationOffset = -Math.PI / 2;
  for (let i = 0; i < limited; i++) {
    const angle = i * angleStep + rotationOffset;
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    points.push(String(x) + "," + String(y));
  }
  return points.join(" ");
}

export function patternBackground(
  pattern: DiePattern,
  colorHex: string,
): string {
  const lighten = tint(colorHex, 0.35);
  const darken = tint(colorHex, -0.35);
  switch (pattern) {
    case "solid":
      return colorHex;
    case "stripes":
      return `repeating-linear-gradient(45deg, ${colorHex}, ${colorHex} 6px, ${lighten} 6px, ${lighten} 12px)`;
    case "dots":
      return `radial-gradient(circle at 4px 4px, ${lighten} 2px, ${colorHex} 2px)`;
    case "gradient":
      return `linear-gradient(135deg, ${lighten}, ${darken})`;
    case "crosshatch":
      return `repeating-linear-gradient(45deg, ${colorHex}, ${colorHex} 5px, ${lighten} 5px, ${lighten} 10px), repeating-linear-gradient(-45deg, ${colorHex}, ${colorHex} 5px, ${lighten} 5px, ${lighten} 10px)`;
    default:
      return colorHex;
  }
}

function tint(hex: string, percent: number): string {
  const { r, g, b } = parseHex(hex);
  const factor = percent;
  const adjust = (c: number) => {
    const target = factor < 0 ? 0 : 255;
    const result = Math.round(c + (target - c) * Math.abs(factor));
    return clamp(result, 0, 255);
  };
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function diePreviewSvgProps(
  die: Pick<DieDefinition, "sides" | "id" | "colorHex" | "pattern">,
) {
  const angle = hashAngle(die.id);
  const points = polygonPoints(Math.min(die.sides, 24));
  return { angle, points };
}
