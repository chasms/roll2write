# Roll2Write

This project is configured with:

- Vite
- Typescript
- React
- SCSS Modules (migrated from PandaCSS)
- HMR via [SWC](https://swc.rs/)
- [ESLint rules](./eslint.config.ts)
- [VSCode settings](./.vscode/settings.json)
- and [Copilot Instructions](./.github/copilot-instructions.md)

### Getting Started

```bash
npm install
npm run dev
```

##### Linting

```bash
npm run lint
```

or to run autofix (this will happen automatically on save but sometimes it's still useful):

```bash
npm run lintfix
```

##### Types

```bash
npm run typecheck
```

or to run a continuous typecheck in an open shell:

```bash
npm run typewatch
```
