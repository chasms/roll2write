# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React TypeScript Vite PandaCSS project.

## Project Guidelines

- Use React functional components with hooks
- Follow strict TypeScript practices
- Use Vitest for testing with React Testing Library
- Use pandaCSS for styling initially, keeping it simple and functional
- Utilize `PRODUCT_REQUIREMENTS.md` as a document for keeping all product details in order. There should be a section there with a backlog of high-level features tracking progress and sorting for priority order, as well as sections below where each feature from the backlog links to a detailed overview of product requirements and acceptance criteria. Features should be written as much as they can be in the form of user stories. In some cases it is ok to write technical enablers or product spikes.
- When developing the product, clarifying the product direction and product requirements is primary and implementation is secondary. Please ask clarifying questions of the user to deepen your understanding of what we are aiming to build, how we are trying to build it, and why we are making the choices we are making - before just going ahead with an implementation.
- When adding/modifying/clarifying product details: always update `PRODUCT_REQUIREMENTS.md` (list features, add and adjust product requirements and acceptance criteria, mark progress) and relevant docs (`README.md` for general information, and when appropriate, larger forays into more specific documentation should be organized into new markdown files under docs/). Include rationale for architectural decisions and implementation details.
- When new instructions are given that could apply to documentation, code style, and or general guidelines for how copilot should behave, please ask the user about adding them to this document to codify them as instructions going forward.

## Code Style

- Use descriptive names for variables and functions, and avoid abbreviations and acronyms in variable, function, and type names; prefer fully spelled-out descriptive identifiers (e.g., `oscillatorNode` not `osc`, `outputGainNode` not `out`).
- Try as much as possible to create types that can be shareable across the applications so that data flow can be connected and strongly typed
- Separate business logic from UI rendering logic as much as possible. Where applicable, suggest state management solutions for business logic to pull it out of views.

## Styling Conventions

- Prefer static PandaCSS recipe / variant (cva/recipes) usage; avoid inline dynamic style objects with ternaries.
- If a visual state changes (selected, active, disabled, rolling, etc.), express it through recipe variants or conditional className composition, not dynamic `css({ ... })` values.
- All new components should define reusable variant recipes for interactive elements (buttons, list items, presets) instead of repeating style objects.
- Keep runtime logic out of style definitions; pass booleans into variants rather than computing colors inline.
- When using Panda `css` or `cva`, assign the resulting class to a clearly named constant (e.g., `diceListContainerClass`, `createSongButtonClass`) and pass that variable to `className` instead of inlining the call inside JSX. This improves readability and reusability.
- Avoid abbreviated variable names in style code; prefer verbose descriptive names (`selectedDieButtonClass` not `selBtn`).
