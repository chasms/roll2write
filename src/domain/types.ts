// 3D-feasible patterns (reduced from previous list to those we can procedurally texture simply)
export type DiePattern = "solid" | "stripes" | "gradient";

export interface DieDefinition {
  id: string;
  name: string; // unique, case-insensitive
  sides: number;
  options: string[]; // length === sides
  createdAt: string; // ISO
  updatedAt: string; // ISO
  colorHex: string; // user-chosen hex color (#RRGGBB)
  pattern: DiePattern; // visual pattern key
  // Optional advanced appearance overrides for 3D rendering
  appearance?: {
    roughness?: number;
    metalness?: number;
    reflectivity?: number;
    transmission?: number;
    ior?: number;
    thickness?: number;
    attenuationDistance?: number;
    attenuationColor?: string;
    opacity?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    sheen?: number;
    sheenColor?: string;
    sparkleIntensity?: number;
    sparkleCount?: number;
    sparkleColor?: string;
  };
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

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

export const DIE_SIDE_PRESETS = [4, 6, 8, 12, 20, 100] as const; // removed d10 per new fixed set

export const DIE_PATTERNS: DiePattern[] = ["solid", "stripes", "gradient"];
