import type { DieDefinition } from "./types";

// Helper to stamp timestamps
const nowIso = () => new Date().toISOString();

// Generic factory so all defaults share consistent timestamps except id uniqueness.
function makeDie(partial: Omit<DieDefinition, "createdAt" | "updatedAt">): DieDefinition {
  const ts = nowIso();
  return { ...partial, createdAt: ts, updatedAt: ts };
}

export const DEFAULT_DICE: DieDefinition[] = [
  // 1. Instruments (d20 for variety)
  makeDie({
    id: "instruments",
    name: "Instruments",
    sides: 20,
    colorHex: "#7b5df9",
    pattern: "gradient",
    options: [
      "acoustic guitar",
      "electric guitar",
      "bass guitar",
      "piano / keys",
      "analog synth",
      "modular synth",
      "digital pad",
      "drum kit",
      "drum machine",
      "hand percussion",
      "violin",
      "cello",
      "brass section",
      "saxophone",
      "flute",
      "harp",
      "vocals / choir",
      "found sounds",
      "field recording",
      "sound design fx",
    ],
  }),
  // 2. Personas (d20)
  makeDie({
    id: "personas",
    name: "Personas",
    sides: 20,
  // Lightened & more vibrant base color
  colorHex: "#d8b6ff",
    // Add subtle gradient and advanced translucent / shimmering appearance
    pattern: "gradient",
    options: [
      "restless dreamer",
      "world-weary traveler",
      "reluctant hero",
      "cosmic observer",
      "digital native",
      "ancient storyteller",
      "hopeful romantic",
      "cynical realist",
      "runaway royal",
      "street poet",
      "time-lost veteran",
      "android learning love",
      "mythic trickster",
      "storm chaser",
      "lone outlaw",
      "underground archivist",
      "exiled alchemist",
      "oracle of static",
      "space salvager",
      "gravity rebel",
    ],
    appearance: {
      roughness: 0.06,
      metalness: 0.18,
      reflectivity: 0.88,
      transmission: 0.92,
      ior: 1.43,
      thickness: 1.05,
      attenuationDistance: 2.3,
      attenuationColor: "#d8b6ff",
      opacity: 1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      sheen: 0.6,
      sheenColor: "#ffe6ff",
      sparkleIntensity: 0.55,
      sparkleCount: 165,
      sparkleColor: "#ffe6ff",
    },
  }),
  // 3. Genre Fusions (d20)
  makeDie({
    id: "genre-fusions",
    name: "Genre Fusions",
    sides: 20,
    colorHex: "#8bd6ff",
    pattern: "stripes",
    options: [
      "grunge-pop",
      "hyper-rock",
      "lofi-disco",
      "synth-grunge",
      "neo-chiptune",
      "ambient-trap",
      "folktronica",
      "doom-wave",
      "cyber-ska",
      "post-funk",
      "gospel-synth",
      "baroque-hop",
      "industrial-soul",
      "shoegaze-house",
      "prog-dance",
      "psyche-drill",
      "afro-glitch",
      "dreampunk",
      "jazz-core",
      "orchestral-vapor",
    ],
  }),
  // 4. Devices (d8) based on provided screenshot categories
  makeDie({
    id: "devices",
    name: "Devices",
    sides: 8,
    colorHex: "#38bdf8", // cyan / aqua
    pattern: "gradient",
    options: [
      "alliteration",
      "antithesis",
      "apostrophe",
      "chiasmus",
      "consonance",
      "metaphor",
      "personification",
      "portmanteau",
    ],
    appearance: {
      roughness: 0.12,
      metalness: 0.35,
      reflectivity: 0.85,
      transmission: 0.4,
      ior: 1.45,
      thickness: 0.8,
      attenuationDistance: 1.4,
      attenuationColor: "#38bdf8",
      opacity: 1,
      clearcoat: 0.65,
      clearcoatRoughness: 0.08,
      sheen: 0.6,
      sheenColor: "#8bd6ff",
      sparkleIntensity: 0.5,
      sparkleCount: 130,
      sparkleColor: "#ffffff",
    },
  }),
];

export type DefaultDieId = (typeof DEFAULT_DICE)[number]["id"];
