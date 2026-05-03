# Setup Requirements

Project: `enns-site-remake`  
Runtime: Node.js

## System Requirements

- Node.js >= 20
- npm >= 10

## First-Time Setup

1. `npm ci`
2. Copy `.env.example` to `.env.local`
3. Fill required env vars

## Run Locally

- `npm run dev`

## Quality Checks

- `npm run format:check`
- `npm run lint`
- `npm run build`

## Formatting and Linting

- `npm run format`
- `npm run lint:fix`

## Git Hooks

- Husky and lint-staged are configured
- Pre-commit runs lint and format on staged files

## Deploy Notes (Vercel)

- `.env.local` is local-only
- Set the same env vars in Vercel Project Settings -> Environment Variables
