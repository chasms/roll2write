import type { DieDefinition } from "./types";

// Helper to stamp timestamps
const nowIso = () => new Date().toISOString();

// Generic factory so all defaults share consistent timestamps except id uniqueness.
function makeDie(
  partial: Omit<DieDefinition, "createdAt" | "updatedAt">
): DieDefinition {
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
  // 5. Oblique Strategies (large deck)
  makeDie({
    id: "oblique-strategies",
    name: "Oblique Strategies",
    // Count options below to set sides
    sides: 113,
    colorHex: "#22262e",
    pattern: "gradient",
    options: [
      "Abandon normal instruments",
      "Accept advice",
      "Accretion",
      "A line has two sides",
      "Allow an easement (an easement is the abandonment of a stricture)",
      "Are there sections? Consider transitions",
      "Ask people to work against their better judgment",
      "Ask your body",
      "Assemble some of the instruments in a group and treat the group",
      "Balance the consistency principle with the inconsistency principle",
      "Be dirty",
      "Breathe more deeply",
      "Bridges -build -burn",
      "Cascades",
      "Change instrument roles",
      "Change nothing and continue with immaculate consistency",
      "Children's voices -speaking -singing",
      "Cluster analysis",
      "Consider different fading systems",
      "Consult other sources -promising -unpromising",
      "Convert a melodic element into a rhythmic element",
      "Courage!",
      "Cut a vital connection",
      "Decorate, decorate",
      "Define an area as 'safe' and use it as an anchor",
      "Destroy -nothing -the most important thing",
      "Discard an axiom",
      "Disconnect from desire",
      "Discover the recipes you are using and abandon them",
      "Distorting time",
      "Do nothing for as long as possible",
      "Don't be afraid of things because they're easy to do",
      "Don't be frightened of cliches",
      "Don't be frightened to display your talents",
      "Don't break the silence",
      "Don't stress one thing more than another",
      "Do something boring",
      "Do the washing up",
      "Do the words need changing?",
      "Do we need holes?",
      "Emphasize differences",
      "Emphasize repetitions",
      "Emphasize the flaws",
      "Faced with a choice, do both (given by Dieter Roth)",
      "Feedback recordings into an acoustic situation",
      "Fill every beat with something",
      "Get your neck massaged",
      "Ghost echoes",
      "Give the game away",
      "Give way to your worst impulse",
      "Go slowly all the way round the outside",
      "Honor thy error as a hidden intention",
      "How would you have done it?",
      "Humanize something free of error",
      "Imagine the music as a moving chain or caterpillar",
      "Imagine the music as a set of disconnected events",
      "Infinitesimal gradations",
      "Intentions -credibility of -nobility of -humility of",
      "Into the impossible",
      "Is it finished?",
      "Is there something missing?",
      "Is the tuning appropriate?",
      "Just carry on",
      "Left channel, right channel, center channel",
      "Listen in total darkness, or in a very large room, very quietly",
      "Listen to the quiet voice",
      "Look at a very small object; look at its center",
      "Look at the order in which you do things",
      "Look closely at the most embarrassing details and amplify them",
      "Lowest common denominator check -single beat -single note -single riff",
      "Make a blank valuable by putting it in an exquisite frame",
      "Make an exhaustive list of everything you might do and do the last thing on the list",
      "Make a sudden, destructive, unpredictable action; incorporate",
      "Mechanicalize something idiosyncratic",
      "Mute and continue",
      "Only one element of each kind",
      "(Organic) machinery",
      "Overtly resist change",
      "Put in earplugs",
      "Remember those quiet evenings",
      "Remove ambiguities and convert to specifics",
      "Remove specifics and convert to ambiguities",
      "Repetition is a form of change",
      "Reverse",
      "Short circuit",
      "Improve his virility (shovels them straight into his lap)",
      "Shut the door and listen from outside",
      "Simple subtraction",
      "Spectrum analysis",
      "Take a break",
      "Take away the elements in order of apparent non-importance",
      "Tape your mouth (given by Ritva Saarikko)",
      "The inconsistency principle",
      "The tape is now the music",
      "Think of the radio",
      "Tidy up",
      "Trust in the you of now",
      "Turn it upside down",
      "Twist the spine",
      "Use an old idea",
      "Use an unacceptable color",
      "Use fewer notes",
      "Use filters",
      "Use 'unqualified' people",
      "Water",
      "What are you really thinking about just now? Incorporate",
      "What is the reality of the situation?",
      "What mistakes did you make last time?",
      "What would your closest friend do?",
      "What wouldn't you do?",
      "Work at a different speed",
      "You are an engineer",
      "You can only make one dot at a time",
      "You don't have to be ashamed of using your own ideas",
      "Blank white card",
    ],
    appearance: {
      roughness: 0.5,
      metalness: 0.05,
      reflectivity: 0.2,
      transmission: 0.02,
      ior: 1.3,
      thickness: 0.4,
      attenuationDistance: 0.5,
      attenuationColor: "#22262e",
      opacity: 1,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
      sheen: 0.15,
      sheenColor: "#ffffff",
      sparkleIntensity: 0.05,
      sparkleCount: 15,
      sparkleColor: "#ffffff",
    },
  }),
];

export type DefaultDieId = (typeof DEFAULT_DICE)[number]["id"];

// Oblique Strategies
// <ul>
// <li>Abandon normal instruments</li>
// <li>Accept advice</li>
// <li>Accretion</li>
// <li>A line has two sides</li>
// <li>Allow an easement (an easement is the abandonment of a stricture)</li>
// <li>Are there sections? Consider transitions</li>
// <li>Ask people to work against their better judgment</li>
// <li>Ask your body</li>
// <li>Assemble some of the instruments in a group and treat the group</li>
// <li>Balance the consistency principle with the inconsistency principle</li>
// <li>Be dirty</li>
// <li>Breathe more deeply</li>
// <li>Bridges -build -burn</li>
// <li>Cascades</li>
// <li>Change instrument roles</li>
// <li>Change nothing and continue with immaculate consistency</li>
// <li>Children's voices -speaking -singing</li>
// <li>Cluster analysis</li>
// <li>Consider different fading systems</li>
// <li>Consult other sources -promising -unpromising</li>
// <li>Convert a melodic element into a rhythmic element</li>
// <li>Courage!</li>
// <li>Cut a vital connection</li>
// <li>Decorate, decorate</li>
// <li>Define an area as `safe' and use it as an anchor</li>
// <li>Destroy -nothing -the most important thing</li>
// <li>Discard an axiom</li>
// <li>Disconnect from desire</li>
// <li>Discover the recipes you are using and abandon them</li>
// <li>Distorting time</li>
// <li>Do nothing for as long as possible</li>
// <li>Don't be afraid of things because they're easy to do</li>
// <li>Don't be frightened of cliches</li>
// <li>Don't be frightened to display your talents</li>
// <li>Don't break the silence</li>
// <li>Don't stress one thing more than another</li>
// <li>Do something boring</li>
// <li>Do the washing up</li>
// <li>Do the words need changing?</li>
// <li>Do we need holes?</li>
// <li>Emphasize differences</li>
// <li>Emphasize repetitions</li>
// <li>Emphasize the flaws</li>
// <li>Faced with a choice, do both (given by Dieter Roth)</li>
// <li>Feedback recordings into an acoustic situation</li>
// <li>Fill every beat with something</li>
// <li>Get your neck massaged</li>
// <li>Ghost echoes</li>
// <li>Give the game away</li>
// <li>Give way to your worst impulse</li>
// <li>Go slowly all the way round the outside</li>
// <li>Honor thy error as a hidden intention</li>
// <li>How would you have done it?</li>
// <li>Humanize something free of error</li>
// <li>Imagine the music as a moving chain or caterpillar</li>
// <li>Imagine the music as a set of disconnected events</li>
// <li>Infinitesimal gradations</li>
// <li>Intentions -credibility of -nobility of -humility of</li>
// <li>Into the impossible</li>
// <li>Is it finished?</li>
// <li>Is there something missing?</li>
// <li>Is the tuning appropriate?</li>
// <li>Just carry on</li>
// <li>Left channel, right channel, center channel</li>
// <li>Listen in total darkness, or in a very large room, very quietly</li>
// <li>Listen to the quiet voice</li>
// <li>Look at a very small object; look at its center</li>
// <li>Look at the order in which you do things</li>
// <li>Look closely at the most embarrassing details and amplify them</li>
// <li>Lowest common denominator check -single beat -single note -single</li>
// <li>riff</li>
// <li>Make a blank valuable by putting it in an exquisite frame</li>
// <li>Make an exhaustive list of everything you might do and do the last</li>
// <li>thing on the list</li>
// <li>Make a sudden, destructive, unpredictable action; incorporate</li>
// <li>Mechanicalize something idiosyncratic</li>
// <li>Mute and continue</li>
// <li>Only one element of each kind</li>
// <li>(Organic) machinery</li>
// <li>Overtly resist change</li>
// <li>Put in earplugs</li>
// <li>Remember those quiet evenings</li>
// <li>Remove ambiguities and convert to specifics</li>
// <li>Remove specifics and convert to ambiguities</li>
// <li>Repetition is a form of change</li>
// <li>Reverse</li>
// <li>Short circuit</li>
// <li>improve his virility shovels them straight into his lap)</li>
// <li>Shut the door and listen from outside</li>
// <li>Simple subtraction</li>
// <li>Spectrum analysis</li>
// <li>Take a break</li>
// <li>Take away the elements in order of apparent non-importance</li>
// <li>Tape your mouth (given by Ritva Saarikko)</li>
// <li>The inconsistency principle</li>
// <li>The tape is now the music</li>
// <li>Think of the radio</li>
// <li>Tidy up</li>
// <li>Trust in the you of now</li>
// <li>Turn it upside down</li>
// <li>Twist the spine</li>
// <li>Use an old idea</li>
// <li>Use an unacceptable color</li>
// <li>Use fewer notes</li>
// <li>Use filters</li>
// <li>Use "unqualified" people</li>
// <li>Water</li>
// <li>What are you really thinking about just now? Incorporate</li>
// <li>What is the reality of the situation?</li>
// <li>What mistakes did you make last time?</li>
// <li>What would your closest friend do?</li>
// <li>What wouldn't you do?</li>
// <li>Work at a different speed</li>
// <li>You are an engineer</li>
// <li>You can only make one dot at a time</li>
// <li>You don't have to be ashamed of using your own ideas</li>
// <li>[blank white card]</li>
// </ul>
