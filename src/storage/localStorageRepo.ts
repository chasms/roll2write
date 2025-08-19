import type { DieDefinition, RollResult, Song } from "../domain/types";

// Storage keys
const DICE_KEY = "r2w:dice";
const ROLLS_KEY = "r2w:rolls";
const SONGS_KEY = "r2w:songs";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Basic in-memory cache to avoid repeated JSON parsing each render.
let diceCache: DieDefinition[] | null = null;
let rollsCache: RollResult[] | null = null;
let songsCache: Song[] | null = null;

function loadDice(): DieDefinition[] {
  diceCache ??= safeParse<DieDefinition[]>(localStorage.getItem(DICE_KEY), []);
  return diceCache;
}
function persistDice(list: DieDefinition[]) {
  diceCache = list;
  localStorage.setItem(DICE_KEY, JSON.stringify(list));
}

function loadRolls(): RollResult[] {
  rollsCache ??= safeParse<RollResult[]>(localStorage.getItem(ROLLS_KEY), []);
  return rollsCache;
}
function persistRolls(list: RollResult[]) {
  rollsCache = list;
  localStorage.setItem(ROLLS_KEY, JSON.stringify(list));
}

function loadSongs(): Song[] {
  songsCache ??= safeParse<Song[]>(localStorage.getItem(SONGS_KEY), []);
  return songsCache;
}
function persistSongs(list: Song[]) {
  songsCache = list;
  localStorage.setItem(SONGS_KEY, JSON.stringify(list));
}

// Central defaults for any missing DieDefinition fields (development convenience only)
const DIE_DEFAULTS: DieDefinition = {
  id: "__missing_id__",
  name: "Elements",
  sides: 4,
  options: ["earth", "water", "fire", "earth"],
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  colorHex: "#2aeaffff",
  pattern: "solid",
};

let diceMigrated = false;
function migrateDice(dice: Partial<DieDefinition>[]) {
  let newDice: DieDefinition[] = [];

  for (const die of dice) {
    let newDie: DieDefinition = DIE_DEFAULTS;

    newDie = { ...newDie, ...die };

    newDice = [...newDice, newDie];
  }
  persistDice(newDice);
}
export const repo = {
  getDice: () => {
    let dice = loadDice(); // stable reference unless mutated via addDie

    if (!diceMigrated) {
      migrateDice(dice);
      diceMigrated = true;
      dice = loadDice();
    }

    return dice;
  },
  addDie: (die: DieDefinition) => {
    const list = loadDice();
    list.push(die);
    persistDice(list);
  },
  updateDie: (id: string, updater: (prev: DieDefinition) => DieDefinition) => {
    const list = loadDice();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return;
    list[index] = updater(list[index]);
    persistDice(list);
  },
  getRolls: () => [...loadRolls()],
  addRoll: (roll: RollResult) => {
    const list = loadRolls();
    list.unshift(roll); // newest first
    persistRolls(list);
  },
  getSongs: () => [...loadSongs()],
  addSong: (song: Song) => {
    const list = loadSongs();
    list.push(song);
    persistSongs(list);
  },
  updateSong: (id: string, updater: (prev: Song) => Song) => {
    const list = loadSongs();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return;
    const updated = updater(list[index]);
    list[index] = { ...updated };
    persistSongs(list);
  },
};
