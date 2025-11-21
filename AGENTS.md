# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React + TypeScript + Vite project using SCSS Module.

## Project Guidelines

- Use React functional components with hooks
- Implement as modularly as possible, isolating pure funtions as much as possible to increase deterministic testability
- Follow strict TypeScript practices
- Use Vitest for testing with React Testing Library
- Use modular SCSS with shared tokens/mixins for styling; avoid inline style objects for reusable patterns.
- Utilize `PRODUCT_REQUIREMENTS.md` as a document for keeping all product details in order. There should be a section there with a backlog of high-level features tracking progress and sorting for priority order, as well as sections below where each feature from the backlog links to a detailed overview of product requirements and acceptance criteria. Features should be written as much as they can be in the form of user stories. In some cases it is ok to write technical enablers or product spikes.
- When developing the product, clarifying the product direction and product requirements is primary and implementation is secondary. Please ask clarifying questions of the user to deepen your understanding of what we are aiming to build, how we are trying to build it, and why we are making the choices we are making - before just going ahead with an implementation.
- When adding/modifying/clarifying product details: always update `PRODUCT_REQUIREMENTS.md` (list features, add and adjust product requirements and acceptance criteria, mark progress) and relevant docs (`README.md` for general information, and when appropriate, larger forays into more specific documentation should be organized into new markdown files under docs/). Include rationale for architectural decisions and implementation details.
- When new instructions are given that could apply to documentation, code style, and or general guidelines for how copilot should behave, please ask the user about adding them to this document to codify them as instructions going forward.
- Use test-driven development, building unit tests around any functions that can be discretely testable

## Debugging and Development Tools

- **Prefer MCP tools over bash commands** for debugging and development tasks
- Use `mcp_eslint_lint-files` for code linting instead of `npm run lint`
- Use Chrome DevTools MCP for browser testing and debugging UI interactions
- Only fall back to terminal commands when specific MCP tools are not available
- MCP tools provide better integration, structured output, and error handling

## Test-Driven Development & Testability

**Adopt a test-first approach for all new features and bug fixes.**

### Core Principles

1. **Tests Link to Requirements**: Every test must directly map to a product requirement or acceptance criterion
2. **Pure Functions First**: Extract business logic into pure functions that are easy to test
3. **Maintain Tests with Requirements**: When requirements change, update tests first, then implementation
4. **Red-Green-Refactor**: Write failing test → Make it pass → Refactor for quality

### TDD Workflow

**For new features:**

1. Document requirements and acceptance criteria (in issue, ADR, or `PRODUCT_BACKLOG.md`)
2. Write failing unit tests that verify each acceptance criterion
3. Run tests to confirm they fail (`npm run test`)
4. Implement minimal code to make tests pass
5. Refactor for code quality while keeping tests green
6. Run all quality checks (`npm run lintfix && npm run stylelintfix && npm run typecheck && npm run test`)

**For bug fixes:**

1. Document reproduction steps and expected behavior
2. Write a failing test that reproduces the bug
3. Fix the bug
4. Verify the test now passes
5. Add edge case tests to prevent regression

### Writing Testable Code

**Prefer pure functions for business logic:**

```typescript
// ❌ Hard to test - mixed concerns
function updateSequenceStep(stepIndex: number) {
  const sequence = getSequence();
  sequence[stepIndex] = { note: 60, velocity: 100 };
  saveSequence(sequence);
  renderUI();
}

// ✅ Easy to test - pure function
function setStepNote(
  sequence: SequenceStep[],
  stepIndex: number,
  note: number,
  velocity: number
): SequenceStep[] {
  const newSequence = [...sequence];
  while (newSequence.length <= stepIndex) {
    newSequence.push({});
  }
  newSequence[stepIndex] = { note, velocity };
  return newSequence;
}
```

**Characteristics of pure functions:**

- No side effects (no mutations, no I/O, no DOM access)
- Same input always produces same output
- Can be tested without mocks or setup
- Easy to reason about and refactor

**Extract pure logic from components:**

- Validation logic (e.g., `constrainToRange(value, min, max)`)
- Calculations (e.g., `calculateScrollPosition(containerHeight, rowHeight)`)
- Data transformations (e.g., `applyTranspose(sequence, semitones)`)
- Business rules (e.g., `shouldEnableVelocityInput(step)`)

### Unit Testing Guidelines

**Test file organization:**

- Place tests adjacent to implementation: `Component.tsx` → `Component.test.tsx`
- Group related tests using `describe` blocks
- Use descriptive test names that explain the requirement being tested
- Include references to acceptance criteria in comments

**Example test structure:**

```typescript
describe("SequenceManipulation", () => {
  // AC1: User can add notes by clicking grid cells
  it("should add note when clicking empty cell", () => {
    // Arrange
    const initialSequence = [];

    // Act
    const result = setStepNote(initialSequence, 0, 60, 100);

    // Assert
    expect(result[0]).toEqual({ note: 60, velocity: 100 });
  });

  // AC2: Clicking an occupied cell removes the note
  it("should remove note when clicking occupied cell", () => {
    // Test implementation
  });
});
```

**What to test:**

- ✅ Pure functions (business logic, calculations, transformations)
- ✅ Component behavior (rendering, user interactions, state changes)
- ✅ Edge cases (boundary values, empty states, error conditions)
- ✅ Integration between components
- ❌ Implementation details (private methods, internal state structure)
- ❌ Third-party library internals

### Frontend Testing with Chrome DevTools MCP

**For UI/layout issues, follow this systematic debugging process:**

**1. Document the Issue**

- Write clear reproduction steps
- Define acceptance criteria (what should happen vs what is happening)
- Take baseline screenshot: `mcp__chrome-devtools__take_screenshot()`

**Example issue template:**

```markdown
## Bug: Velocity sliders misaligned with grid columns

### Reproduction Steps

1. Open Piano Roll Modal
2. Add notes to steps 1, 4, and 8
3. Observe velocity sliders at bottom

### Acceptance Criteria

- [ ] Velocity slider for step 1 aligns with grid column 1
- [ ] Velocity slider for step 4 aligns with grid column 4
- [ ] Velocity slider for step 8 aligns with grid column 8
- [ ] Alignment verified within 1px tolerance

### Current Behavior

Velocity sliders appear offset to the right by ~5px
```

**2. Measure Current State**

**3. Make Changes**

- Implement fix based on measurements
- Hot reload should update the page automatically

**4. Verify Fix**

- Take post-fix screenshot: `mcp__chrome-devtools__take_screenshot()`
- Re-measure to confirm alignment
- Visual validation: Does it LOOK correct? (primary check)
- Programmatic validation: Do measurements confirm? (secondary check)
- Verify each acceptance criterion

**5. Document Results**

**6. Add Regression Test**

### Linking Tests to Requirements

### Test Maintenance

**When requirements change:**

1. Update acceptance criteria in requirements document
2. Update or add tests to match new criteria
3. Run tests to see what breaks (`npm run test`)
4. Update implementation to make tests pass
5. Verify all quality checks pass

**Keep tests synchronized:**

- Remove tests for removed features
- Update test descriptions when behavior changes
- Add tests for new edge cases discovered in production
- Review test coverage regularly

## Code Quality Checks

**After completing any code changes, ALWAYS run the following commands in sequence and fix any errors:**

1. `npm run lintfix` - Auto-fix ESLint issues
2. `npm run stylelintfix` - Auto-fix CSS/styling issues
3. `npm run typecheck` - Verify TypeScript type correctness
4. `npm run test` - Run all tests to ensure nothing broke

**Workflow:**

- Run all four commands after making changes
- If any command reports errors that cannot be auto-fixed, manually fix them
- Re-run the failing command to verify the fix
- Only consider the task complete when all four checks pass successfully

## Frontend Debugging Protocol

**For all UI/layout changes, follow the systematic validation process documented in `docs/FRONTEND_TESTING_PROTOCOL.md`.**

### Core Principles

1. **Visual Validation First**: If it looks wrong to human eyes, it IS wrong - measurements can lie
2. **Before/After Screenshots**: ALWAYS capture baseline before making changes
3. **Measure What Users See**: Measure visual elements, not containers or parent elements
4. **Explicit Acceptance Criteria**: Document exactly what should be fixed before starting
5. **Evidence-Based Validation**: Every fix requires screenshot and measurement proof

### Mandatory Workflow

**Before making changes:**

- [ ] Document acceptance criteria explicitly
- [ ] Take baseline screenshot using `mcp__chrome-devtools__take_screenshot()`
- [ ] Measure current state with `mcp__chrome-devtools__evaluate_script()`

**After making changes:**

- [ ] Take post-fix screenshot
- [ ] Visual validation: Does it LOOK correct? (primary check)
- [ ] Programmatic validation: Do measurements confirm? (secondary check)
- [ ] Verify EACH acceptance criterion with evidence
- [ ] If visual and programmatic disagree, investigate why (trust visual)

### MCP Chrome DevTools Workflows

For specific tool usage patterns, see `docs/CHROME_DEVTOOLS_WORKFLOWS.md`. Key patterns:

**Before/After Comparison:**

```javascript
// 1. Before
mcp__chrome - devtools__take_screenshot();
// 2. Make changes
// 3. After
mcp__chrome - devtools__take_screenshot();
// 4. Visual comparison (primary validation)
```

**Element Alignment Check:**

```javascript
mcp__chrome -
  devtools__evaluate_script({
    function: `() => {
    const elem1 = document.querySelector('.element-1');
    const elem2 = document.querySelector('.element-2');
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();
    const center1 = rect1.left + rect1.width / 2;
    const center2 = rect2.left + rect2.width / 2;
    return {
      offset: (center1 - center2).toFixed(2),
      aligned: Math.abs(center1 - center2) < 1
    };
  }`,
  });
```

### Common Pitfalls to Avoid

- ❌ **Never skip baseline screenshot** - Without it, you can't prove the fix worked
- ❌ **Never measure containers instead of visual elements** - Containers can be aligned while contents are not
- ❌ **Never trust measurements over eyes** - If it looks wrong, investigate why measurements disagree
- ❌ **Never declare success without visual check** - Code can lie, pixels don't
- ❌ **Never test only one state** - Check multiple scenarios, zoom levels, screen sizes

### Documentation Requirements

Every frontend fix must include:

- Before screenshot (showing the problem)
- After screenshot (showing the fix)
- Measurement data (if applicable)
- Pass/fail for each acceptance criterion
- Evidence that visual and programmatic validation agree

See `docs/templates/FRONTEND_BUG_REPORT.md` for the required format.

## Code Style

- Use descriptive names for variables and functions, and avoid abbreviations and acronyms in variable, function, and type names; prefer fully spelled-out descriptive identifiers (e.g., `oscillatorNode` not `osc`, `outputGainNode` not `out`).
- Try as much as possible to create types that can be shareable across the applications so that data flow can be connected and strongly typed
- Separate business logic from UI rendering logic as much as possible. Where applicable, suggest state management solutions for business logic to pull it out of views.

## Styling Conventions

- Prefer SCSS modules per component plus shared partials; encode interactive states with BEM-like suffix classes or state modifiers.
- Keep runtime logic out of SCSS; toggle classes instead of computing inline colors where practical.
- Name classes descriptively in kebab-case (e.g., `option-list`, `toast-layer`, `fab`) avoiding abbreviations.

## Requirement-Oriented Development Framework

**Adopt a skeptical validation approach over optimistic assumptions. Every feature must be rigorously validated before being considered complete.**

### Mandatory Requirements Process

- **Acceptance Criteria**: Define specific, measurable criteria before implementation begins. Ask about any clarifications that may be needed.
- **Reproduction Steps**: Document exact steps to reproduce both success and failure scenarios.
- **Testing Protocol**: Create systematic test cases covering normal, edge, and error conditions
- **Evidence Collection**: Use screenshots, console logs, and measurable data to validate functionality
- **Validation Framework**: Establish tolerance thresholds (e.g., "no visual overlaps within 10px tolerance")

### Implementation Standards

- **Documentation First**: Write clear requirements and acceptance criteria before coding
- **Prove, Don't Assume**: Use browser testing, automated tests, or manual verification to prove functionality works
- **Edge Case Coverage**: Test boundary conditions, error states, and unexpected user interactions
- **Regression Prevention**: Verify existing functionality remains intact after changes
- **Measurement-Based Success**: Use quantifiable metrics rather than subjective assessments

### Skeptical Development Mindset

- Question optimistic assumptions about code behavior
- Assume features are broken until proven working through systematic testing
- Demand evidence-based validation rather than theoretical correctness
- Prioritize thorough testing over rapid delivery
- Document failure modes and their prevention strategies
