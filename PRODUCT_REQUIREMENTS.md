## Roll2Write Product Requirements (Initial Draft)

### Vision
Give creators a fast way to map custom textual (or future rich) outcomes onto virtual dice, roll them with a little delight, and organize resulting sequences ("songs") for later reference or creative use.

### Glossary
- Die / Dice: A user-defined mapping from numeric sides (d4, d6, d8, d10, d12, d20, d100, or custom) to option strings.
- Roll: A single randomized selection (uniform) of one side of a die producing an outcome option.
- Roll History: Persisted chronological list of rolls.
- Song: A named grouping of roll outcomes (ordered) created from selected historical rolls.

### Out of Scope (for this iteration)
- Authentication / multi-user sync
- Cloud backend (localStorage only now)
- Editing existing dice or songs after creation (except future enhancement section)
- Rich media outcomes (text only)
- Weighted dice

### Core User Stories
1. As a user, I can create a new die by choosing a number of sides and entering a name so I can distinguish it later.
2. As a user, I must provide exactly one option string per side so that every numeric outcome maps to an option.
3. As a user, I see a list of my saved dice and can select one to roll.
4. As a user, I can press a Roll button for the selected die, see an animation (~1s) indicating rolling, and then see the resulting option.
5. As a user, every roll is recorded in a persistent history with timestamp, die name, and outcome.
6. As a user, I can select multiple historical rolls and group them into a new song by providing a song name.
7. As a user, I can view a list of songs and expand a song to view its ordered outcomes.
8. As a user, my dice, roll history, and songs persist after refreshing the page (localStorage persistence).

### Acceptance Criteria
- Dice Creation Validation:
  - Die name required; trim whitespace; must be unique (case-insensitive) among existing dice.
  - Sides must be in {4,6,8,10,12,20,100} OR a custom positive integer between 2 and 200 (future UI toggle; initial UI: predefined list + custom option field).
  - Exactly N non-empty option strings after trimming; no blank options allowed.
- Storage Keys: `r2w:dice`, `r2w:rolls`, `r2w:songs` storing JSON arrays.
- Rolling:
  - Distribution: uniform random among sides using `Math.random()` (future: crypto optional toggle).
  - UI disables Roll button while animation active.
  - Animation duration approx 1000ms; after completion final result shown and appended to history.
- History:
  - Most recent roll appears at top.
  - Selecting rolls (checkboxes) enables a "Create Song" action requiring a non-empty name.
  - After song created, selection clears.
- Songs:
  - Stored with ordered list of roll ids.
  - Display song name and count of rolls; expandable to show sequence (die name + outcome text + timestamp).

### Data Shapes (v1)
```
DieDefinition {
  id: string;            // uuid
  name: string;
  sides: number;
  options: string[];     // length === sides
  createdAt: string;     // ISO
  updatedAt: string;     // ISO (same as createdAt for now)
}

RollResult {
  id: string;            // uuid
  dieId: string;
  sideIndex: number;     // 0-based
  option: string;        // convenience copy
  timestamp: string;     // ISO
}

Song {
  id: string;            // uuid
  name: string;
  rollIds: string[];     // ordered
  createdAt: string;     // ISO
}
```

### Non-Functional
- All core operations should remain responsive for up to 500 dice, 10k rolls, 500 songs (simple in-memory arrays + localStorage flush).
- TypeScript strict mode passes.
- Basic unit tests cover: dice validation, roll uniformity sanity (structure), and song creation logic (happy path & validation failures).

### Future Enhancements (Not Implemented Now)
- Edit / delete dice & songs
- Weighted probabilities
- Multi-select roll & simultaneous multi-die rolling
- Export / import JSON
- Crypto-based randomness toggle
- Rich formatting / tagging of outcomes
- Filtering & search of history
- Drag-and-drop ordering inside songs

### Open Questions (Assumptions Made Now)
- Assumed uniqueness of die names required for clarity.
- Assumed songs are immutable sequences once created (no edits yet).
- Assumed custom side counts allowed (UI will include a Custom option). If undesired, can remove easily.

### Status
- 2025-08-19: Initial draft added with v1 scope.
