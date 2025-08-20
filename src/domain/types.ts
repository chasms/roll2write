export type DiePattern = "solid" | "stripes" | "dots" | "gradient" | "crosshatch";

export interface DieDefinition {
  id: string;
  name: string; // unique, case-insensitive
  sides: number;
  options: string[]; // length === sides
  createdAt: string; // ISO
  updatedAt: string; // ISO
  colorHex: string; // user-chosen hex color (#RRGGBB)
  pattern: DiePattern; // visual pattern key
}

export interface RollResult {
  id: string;
  dieId: string;
  sideIndex: number; // 0-based index into options
  option: string; // cached convenience
  timestamp: string; // ISO
}

export interface Song {
  id: string;
  name: string;
  rollIds: string[]; // ordered
  createdAt: string; // ISO
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

export const DIE_SIDE_PRESETS = [4, 6, 8, 10, 12, 20, 100] as const;

export const DIE_PATTERNS: DiePattern[] = ["solid", "stripes", "dots", "gradient", "crosshatch"];
