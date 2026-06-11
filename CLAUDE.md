# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site built with Next.js 13 (Pages Router), TypeScript, and SCSS Modules. Content (work entries) is fetched from microCMS at build time. Deployed to Vercel: https://kai-itakura-portfolio.vercel.app

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build; postbuild auto-generates sitemap via next-sitemap
npm start          # Serve the production build
npm run lint       # next lint
npm run lint-fix   # eslint --fix across all js/jsx/ts/tsx
```

There is no test runner configured in this project.

## Environment variables

Required for the build to fetch content (set in `.env.local`, not committed):

- `SERVICE_DOMAIN` / `API_KEY` — microCMS credentials used by `lib/api.tsx`
- `NEXT_PUBLIC_GA_ID` — Google Analytics measurement ID (read in `lib/gtag.tsx`)

Without microCMS credentials, `getStaticProps`/`getStaticPaths` will fail at build time since all work pages are statically generated from the CMS.

## Architecture

**Data flow (CMS → static pages):** All dynamic content comes from the microCMS `works` endpoint. `lib/api.tsx` wraps the `microcms-js-sdk` client and exposes three fetchers: `getAllWorks` (list), `getAllSlugs` (for paths/pagination), and `getPostBySlug` (single work). These are only ever called from `getStaticProps`/`getStaticPaths` — there is no client-side data fetching. `pages/api/` is unused scaffolding.

**Image blur placeholders:** Pages fetch images from microCMS, then call `getPlaiceholder` (server-side, in `getStaticProps`) to generate a base64 `blurDataURL` that is injected back onto each image object before being passed as props. The `Image` type already reserves a `blurDataURL` field for this. microCMS image host (`images.microcms-assets.io`) is allow-listed in `next.config.js`.

**Pagination:** `lib/prev-next-work.tsx` computes prev/next work from the ordered slug list. Note the ordering is intentionally reversed (prev = next index, next = previous index) and wraps to empty `{ title: '', slug: '' }` at the boundaries.

**Page shell:** `pages/_app.tsx` wraps every page in `components/layout.tsx` (Header + main + Footer), injects the Google Analytics scripts, and tracks route changes via `gtag.preview`. Every page renders its own `<Meta>` (`components/meta.tsx`) for per-page title/OG tags; site-wide defaults live in `lib/constants.tsx` (`siteMeta`).

**Components are presentational:** `components/` are stateless view components that receive typed props. Pages compose them and own all data fetching.

## Conventions

- **Types:** All shared types live in a single file, `types/Type.ts`, and are imported by both pages and components. Add new prop/content types there.
- **Path alias:** `@/*` maps to the repo root (configured in both `tsconfig.json` and `jsconfig.json`). Imports are inconsistent — some use `@/lib/...`, some use bare `lib/...`/`types/...` (also resolvable via `baseUrl: "."`). Both work.
- **Styling:** Each component has a matching SCSS Module in `styles/` (e.g. `components/hero.tsx` → `styles/hero.module.scss`). Shared variables/mixins are in `styles/_variable.scss` and `styles/_mixin.scss`. The `assets/css/` directory contains stale compiled CSS and is not part of the build — edit the SCSS in `styles/`, not these.
- **Formatting (Prettier):** no semicolons, single quotes (incl. JSX), no trailing commas, 2-space indent, 120 print width.

## Source layout

- `pages/` — routes (Pages Router): `index.tsx` (home), `about.tsx`, `works/index.tsx` (list), `works/[slug].tsx` (work detail)
- `components/` — presentational React components
- `lib/` — data fetching (`api.tsx`), pagination logic, analytics, constants
- `types/Type.ts` — all shared TypeScript types
- `styles/` — SCSS Modules + shared partials
