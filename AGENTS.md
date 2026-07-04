# AGENTS.md – Tower Staff

## Project Snapshot

- `tower-staff` is a React 18 + TypeScript staff web app for Tower Assistance.
- The app lets staff handle Tower calls,
  use Azure Communication Services,
  and exchange data-channel messages with the caller apps.
- Application code lives in `src/`.
- Webpack, Jest, environment loading, and dev-server configuration live in `config/`.
- Script entry points live in `scripts/` and use CommonJS.
- Static browser assets live in `public/`.
- Ambient shared declarations live in `types/`.

## Commands

- Install dependencies with `npm ci`.
- Start the development server with `npm start`.
- Run the Jest suite with `CI=true npm test -- --watchAll=false`.
- Build production assets with `npm run build`.
- CI uses Node.js 22,
  runs `npm ci`,
  then runs `CI=true npm test -- --watchAll=false`.
- There is no separate lint or typecheck npm script at the moment;
  `npm run build` exercises the webpack, ESLint plugin, and TypeScript checker path.

## Environment and Secrets

- The app reads React-style environment variables through `config/env.js`.
- Use ignored local override files such as `.env.local`,
  `.env.development.local`,
  `.env.test.local`,
  or `.env.production.local` for machine-specific values.
- Do not commit real API keys,
  tokens,
  customer data,
  or other secrets.
- The Google Maps key is expected as `REACT_APP_MAPS_API_KEY` for local or deployed use.
- `REACT_APP_TOWER_API_ENDPOINT` can override the backend API endpoint.
- `TOWER_PROXY_TARGET` configures the development server backend proxy target.

## Source Layout

- `src/index.tsx` creates the React root and router.
- `src/Routes/App.tsx` owns app-wide context and the ACS call-client providers.
- `src/Components/` contains UI components and matching SCSS files.
- `src/Hooks/` contains reusable React hooks,
  including ACS calling-stack and device-selection hooks.
- `src/Api/` contains backend API wrappers and their tests.
- `src/Models/` contains TypeScript models and data-channel message types.
- `src/Lib/` contains small parsing and reviver helpers.
- `src/setupTests.ts` is the Jest setup file.

## Code Conventions

- Keep React app code in TypeScript and TSX.
- Use function components and React hooks,
  matching the existing component style.
- Use the automatic React JSX runtime;
  do not add unnecessary `import React` lines solely for JSX.
- Preserve the repository's existing four-space indentation style.
- Keep model and component filenames in the existing PascalCase style.
- Keep hook filenames in the existing `useThing.ts` style.
- Prefer explicit exported model types for data-channel messages and backend payloads.
- Keep data-channel message shapes aligned with the README protocol documentation.
- Place tests next to the code they cover as `*.test.ts` or `*.test.tsx`.

## Config and Scripts

- `config/` and `scripts/` are Node.js files using CommonJS `require` and `module.exports`.
- Keep those files in CommonJS unless the whole toolchain is intentionally migrated.
- The custom webpack config is based on Create React App conventions;
  inspect existing helpers before changing build behavior.
- Do not hand-edit generated output under `build/`,
  `coverage/`,
  or dependency directories.

## Deployment Notes

- `npm run build` writes production assets to `build/`.
- Deploy by uploading the contents of `build/` to the target web server.
- If `REACT_APP_TOWER_API_ENDPOINT` is relative,
  the hosting server must proxy that path to the backend.
- If `REACT_APP_TOWER_API_ENDPOINT` points directly to the backend domain,
  the backend must allow the required cross-origin requests.
