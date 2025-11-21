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

### Core User Stories

1. As a user, I can create a new die by choosing a number of sides and entering a name so I can distinguish it later.
2. As a user, I must provide exactly one option string per side so that every numeric outcome maps to an option.
3. As a user, I see a list of my saved dice and can select one to roll.
4. As a user, I can press a Roll button for the selected die, see an animation (~1s) indicating rolling, and then see the resulting option.
5. As a user, every roll is recorded in a persistent history with timestamp, die name, and outcome.
6. As a user, I can select multiple historical rolls and group them into a new song by providing a song name.
7. As a user, I can view a list of songs and expand a song to view its ordered outcomes.
8. As a user, my dice, roll history, and songs persist after refreshing the page (localStorage persistence).

### Phase 2: Song-First Tabletop & Visual Dice (Planned / In Progress)

New / revised user stories for the tabletop experience:

9. As a user landing on the app, I begin with a blank "current song" draft area (tabletop) where I can name my song but cannot save it until it has at least one roll and a non-empty name.
10. As a user, I see a bottom dice drawer (wooden style) that I can expand/collapse; it shows my dice as visually rendered 2D shapes reflecting their color & pattern.
11. As a user, I can open a second bottom drawer for Past Rolls to optionally pull prior outcomes into my current song draft (selecting a past roll adds its outcome to the song order).
12. As a user, selecting a die in the dice drawer triggers an immediate roll (with animation) and the resulting outcome appears on the tabletop as a rendered die face annotated with the rolled option.
13. As a user, selecting a past roll in the past rolls drawer adds that historical roll (referencing the original roll id) into my current song draft sequence (no re-roll performed).
14. As a user, I can create a new die from inside the dice drawer using a "+" button with a die icon; this opens a full-screen overlay (with blurred background) containing the die creation form.
15. As a user, while creating a die I can live-preview its appearance (color + pattern + shape) as I enter configuration values.
16. As a user, I can choose any color (free-form color picker) and a pattern from a predefined list (solid, stripes, dots, gradient, crosshatch – initial set) for my die.
17. As a user, two dice with identical color/pattern still appear with slightly different orientations (deterministic per die id) so the tabletop feels more organic.
18. As a user, I can collapse drawers (especially on mobile) to reclaim vertical space; drawers remember their open/closed state during the session.
19. (Revised) As a user, a song is auto-created and persisted immediately when I enter a non-empty name; each added roll (new or past) updates it automatically (no manual save button). The name is immutable for now.
20. As a user, I can cancel die creation overlay without saving (no partial die persisted).
21. As a user, the main dice interaction area uses a single shared 3D stage (one WebGL context) to display both my selected dice and the dice library, improving performance and visual coherence. Clicking dice in the library adds them to the selected area; clicking a selected die removes it.

### Additional Acceptance Criteria (Phase 2)

- Song Auto-Save Flow:
  - Song record created immediately when user enters a non-empty name (persisted even with zero rolls initially).
  - Each new roll or selected past roll appends its id to the song and persists instantly.
  - User can remove a roll from the current song; persistence updates accordingly.
  - Song name is immutable after creation (future enhancement may allow rename).
- Dice Drawer:
  - Visual style evokes wood: layered linear / repeating gradients + subtle noise (CSS only, no external images initially).
  - Contains grid / horizontal scroll list of dice thumbnails plus terminal "Create Die" button.
  - Drawer states: open, collapsed; animation purely CSS (height transition).
- Past Rolls Drawer:
  - Shows recent N (e.g., 50) rolls with ability to scroll; selecting one adds to draft (no checkbox selection needed—single tap adds).
  - Does not remove from history; duplicates allowed in a song.
- Die Appearance:
  - colorHex stored as hex (#RRGGBB) exactly as user picked.
  - pattern is one of: solid | stripes | dots | gradient | crosshatch.
  - Rendering uses SVG or styled div with polygon-like shape determined by side count (d4 triangle, d6 square, d8 octagon, d10 decagon, d12 dodecagon, d20 icosagon, default regular polygon for custom counts <= 24 else circle approximation).
  - Orientation angle derived from stable hash of die id (so consistent across sessions and distinct among dice) – no random flicker.
- Die Creation Overlay:
  - Full-screen fixed; backdrop blur (e.g., backdrop-filter: blur(6px)).
  - Centered panel; includes live preview component; Cancel + Save actions; ESC close not required (per initial guidance) but may be added later.
  - Global floating "+" (create die) FAB is hidden while overlay is open to avoid duplicate entry points / focus traps.
- Migration / Backward Compatibility:
  - Existing stored dice lacking colorHex/pattern receive defaults colorHex="#888888" and pattern="solid" when loaded.
- Performance:
  - Deterministic orientation calculation O(1) per die; pattern rendering purely CSS (no large images).
  - A single WebGL context is used for the main screen (selected dice + library) to minimize GPU overhead; thumbnails in secondary UI (modals, lists) may still use lightweight previews as needed.

### Data Shape Extensions (Phase 2)

```
type DiePattern = 'solid' | 'stripes' | 'dots' | 'gradient' | 'crosshatch';

DieDefinition (extended) {
  id: string;
  name: string;
  sides: number;
  options: string[];
  createdAt: string;
  updatedAt: string;
  colorHex: string;     // e.g. #RRGGBB
  pattern: DiePattern;  // enumerated pattern key
}

CurrentSongDraft (ui-only, not persisted) {
  name: string;
  rollIds: string[];
}
```

### Open Questions (Phase 2)

1. Maximum number of rolls displayed in Past Rolls Drawer (assumed 50, virtualize later if needed)?
2. Should user be able to remove a roll from the current song draft before saving? (Assumed YES via small remove icon; to confirm.)
3. Should orientation randomness be purely rotational, or also slight scale / skew? (Assumed rotation only initially.)
4. Should gradient pattern be a fixed preset palette mapping (e.g., lighten/darken of colorHex) or allow secondary color? (Assumed derivative lighten/darken.)
5. Should unsaved draft persist across page refresh (e.g., localStorage draft)? (Assumed NO for now.)

### Status Updates (Phase 2)

- 2025-08-19: Requirements drafted; awaiting confirmations on open questions (1–5) before implementation.

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

## Bug Tracking & Fixes

### Bug #001: Library Die Edit Button Hover State Instability

**Status**: ✅ Fixed (2025-01-18)

**Reported**: 2025-01-18

**Description**:
The edit button that appears when hovering over dice in the library exhibited unstable behavior:

- Sometimes disappeared when the cursor was still over the die
- Difficult to click because it disappeared when transitioning from die to button
- Gap between 3D mesh and HTML button overlay caused hover state loss

**Root Cause Analysis**:

Multiple compounding issues were identified:

1. **Spatial Gap Between 3D Mesh and Edit Button**:
   - Edit button was positioned at `[0, 0.8, 0]` (0.8 units above die center)
   - Physical gap existed between 3D mesh boundary and HTML button
   - When moving from die to button, pointer crossed a "dead zone"
   - During gap crossing, neither element detected the pointer

2. **Pointer Events Configuration**:
   - Parent `<Html>` wrapper had `pointerEvents: "none"`
   - Child button had `pointerEvents: "auto"`
   - This configuration caused event detection gaps in certain scenarios

3. **Insufficient Hover Delay**:
   - Original 150ms delay was borderline insufficient for smooth transitions
   - Users moving cursor at normal speed could still experience flickering

**Acceptance Criteria**:

1. ✅ Edit button appears whenever cursor hovers over any part of the die's 3D mesh
2. ✅ Edit button remains visible when cursor transitions from die mesh to button
3. ✅ Edit button remains visible while cursor hovers over the button
4. ✅ Edit button disappears only after cursor leaves both die mesh AND button area
5. ✅ Edit button appears on correct die (never on wrong die)
6. ✅ Hover state transitions are smooth with no flickering or jumping

**Solution Implemented**:

1. **Reduced Button Distance** ([LibraryDie.tsx:90](src/components/LibraryDie.tsx#L90)):
   - Changed position from `[0, 0.8, 0]` to `[0, 0.6, 0]`
   - Reduced spatial gap between die and button by 25%
   - Minimizes "dead zone" during cursor transition

2. **Added Wrapper Div with Padding** ([LibraryDie.tsx:95-108](src/components/LibraryDie.tsx#L95-L108)):
   - Wrapped button in `<div>` with 8px padding
   - Div has `pointerEvents: "auto"` and handles pointer enter/leave events
   - Creates larger hover target area around button
   - Catches pointer before it leaves the interactive region

3. **Increased Hover Delay** ([DiceStage.tsx:378](src/components/DiceStage.tsx#L378), [DiceStage.tsx:404](src/components/DiceStage.tsx#L404)):
   - Increased timeout from 150ms to 250ms
   - Provides more cushion for cursor transitions
   - Accommodates users with varying cursor speeds

4. **Improved Event Handling Structure**:
   - Moved pointer event handlers from button to wrapper div
   - Wrapper intercepts events before button
   - Eliminates race condition between button rendering and event detection

**Testing & Verification**:

- ✅ All quality checks pass (ESLint, Stylelint, TypeScript, Vitest)
- ✅ Chrome DevTools debugging confirmed stable hover behavior
- ✅ Visual inspection shows smooth transitions
- ✅ No console errors or warnings
- ✅ Existing tests continue to pass (61/61)

**Result**:
Edit button hover functionality is now stable and reliable:

- Button remains visible during cursor transitions
- No flickering or jumping between dice
- Smooth, professional user experience
- Solution addresses root causes, not just symptoms

### Bug #002: Edit Button Click Opens Wrong Modal

**Status**: 🟡 Fix Implemented - User Testing Required (2025-01-18)

**Reported**: 2025-01-18

**Description**:
When clicking the edit button on a library die, the behavior is incorrect:

- Expected: Edit modal should open for the clicked die
- Actual: Die is added to the Selected Dice section instead

**Root Cause Analysis**:
The edit button and die were sharing the same `clickGuardRef`, which is used to prevent accidental clicks during drag operations. When the edit button was clicked:

1. Edit button sets the shared click guard and calls `onEditLibraryDie`
2. Die's click handler also checks the same guard
3. Potential race condition or event bubbling causes die's `onAddFromLibrary` to fire

Additionally, the edit button needed to fully isolate pointer events (onPointerUp was missing) to prevent any interference with the die's click detection.

**Acceptance Criteria**:

1. ⬜ Clicking edit button opens edit modal for the correct die
2. ⬜ Clicking edit button does NOT add die to Selected Dice section
3. ⬜ Edit button click is properly isolated from die click handler
4. ⬜ Event propagation is stopped at button level

**Solution Implemented**:

1. **Separate Click Guard** ([LibraryDie.tsx:41](src/components/LibraryDie.tsx#L41)):
   - Created `editButtonClickGuardRef` independent of die's `clickGuardRef`
   - Edit button now uses its own guard to prevent double-clicks
   - Eliminates interference between die and button click handling

2. **Complete Event Isolation** ([LibraryDie.tsx:115-117](src/components/LibraryDie.tsx#L115-L117)):
   - Added `onPointerUp` handler with `stopPropagation()`
   - Now all pointer events are stopped: onPointerDown, onPointerUp, onPointerOver, onPointerOut, onClick
   - Prevents any event bubbling to parent die group

3. **Independent Hover State** ([LibraryDie.tsx:40](src/components/LibraryDie.tsx#L40)):
   - Edit button maintains `isEditButtonHovered` state
   - Only activates when cursor is over button bounding box
   - No longer inherits die's hover state

**Testing & Verification**:

- ⬜ Verify clicking edit button opens edit modal
- ⬜ Verify die is NOT added to selected section when clicking edit button
- ⬜ Verify edit modal shows correct die data
- ✅ Run quality checks (lintfix, stylelintfix, typecheck, test) - All passing (61/61 tests)

**Related Code**:

- [LibraryDie.tsx:98-161](src/components/LibraryDie.tsx#L98-L161) - Edit button group implementation
- [DiceStage.tsx:443](src/components/DiceStage.tsx#L443) - `onEditLibraryDie` prop passing
- [App.tsx:476-478](src/App.tsx#L476-L478) - Edit modal trigger handler
