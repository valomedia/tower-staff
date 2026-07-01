# AGENTS.md

## Scope

These instructions apply to the entire repository.

## Project overview

This repository contains the React TypeScript staff web app for Tower Assistance.
The app lets staff handle Tower calls,
communicate with caller apps through Azure Communication Services data channels,
and send requests such as location,
photo capture,
camera switching,
torch control,
and call hold/resume events.

Application code lives in `src/`,
webpack and Jest configuration live in `config/`,
project scripts live in `scripts/`,
static public assets live in `public/`,
and shared ambient type declarations live in `types/`.

## Build and test

Run commands from the repository root.

```sh
npm ci
CI=true npm test -- --watchAll=false
npm run build
```

`npm test` runs `scripts/test.js`,
which invokes Jest.
Set `CI=true` or pass `--watchAll=false`
so tests do not enter watch mode in automation.

For documentation-only changes,
`git diff --check` is an acceptable minimal verification step.

## TypeScript and React conventions

Keep TypeScript and React changes consistent with the existing source:

- Use ES module syntax in `src/**/*.ts` and `src/**/*.tsx`.
- Keep relative imports extensionless unless the TypeScript or bundler configuration changes.
- Use 4-space indentation and semicolons,
  matching the existing code.
- Prefer explicit named model types in `src/Models/`
  for data exchanged with the backend or caller apps.
- Keep React components as small focused functions,
  with nearby SCSS files for component-specific styling.
- Use existing hooks under `src/Hooks/`
  for reusable browser,
  calling,
  audio device,
  and photo behavior.
- Preserve current data channel message shapes documented in `README.md`
  unless the issue explicitly asks for a protocol change.
- Add or update Jest tests next to changed behavior when modifying API helpers,
  revivers,
  message models,
  or other directly testable logic.

## JavaScript script and config conventions

Project scripts under `scripts/`
and configuration modules under `config/`
use CommonJS.
Keep that style in those directories unless the build tooling is intentionally migrated.

The webpack configuration is derived from Create React App.
Make the smallest targeted change when editing it,
and avoid rewriting generated-looking configuration blocks unnecessarily.

## Environment and secrets

Do not commit secrets,
private endpoints,
API tokens,
Azure Communication Services credentials,
or customer data.

Tracked `.env`, `.env.development`, `.env.production`,
and `.env.test` files are defaults only.
Local values belong in ignored `.env*.local` files.
The Google Maps browser API key should be supplied through `REACT_APP_MAPS_API_KEY`
in a local environment file,
not hard-coded in source.

## Generated files and dependencies

Do not commit generated output or local dependency directories:

- `build/`
- `coverage/`
- `node_modules/`

If package dependencies change,
update `package-lock.json` together with `package.json`.

## Deployment safety

`npm run build` creates a static production bundle.
Do not upload or deploy the bundle from an agent task
unless the issue explicitly asks for deployment verification
and the target environment has been confirmed.
