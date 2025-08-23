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
    colorHex: "#c184ff",
    pattern: "solid",
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
    colorHex: "#6243f3",
    pattern: "solid",
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
  }),
];

export type DefaultDieId = (typeof DEFAULT_DICE)[number]["id"];
