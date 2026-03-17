# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talk am Pegel is an event/talk showcase website built with **Kirby CMS 3** (PHP 8.2+), **Tailwind CSS 4**, **Alpine.js 3**, and **Vite 8**. Templating uses Laravel Blade via the kirby-blade plugin. UI components come from FlyOnUI.

## Development Commands

```bash
# Frontend dev server (Vite HMR)
pnpm dev

# Production build
pnpm build

# PHP dev server
composer start   # php -S localhost:8000 kirby/router.php

# Code formatting
pnpm prettier --write .
```

Local domain for TLS detection: `talk-am-pegel.test`

Both the Vite dev server and PHP server need to run simultaneously for local development.

## Architecture

### Backend (Kirby CMS)
- `site/blueprints/` — YAML content type definitions (pages, fields, sections)
- `site/models/` — PHP page model classes
- `site/templates/` — Blade templates (`.blade.php`), mapped to Kirby page types
- `site/snippets/` — Reusable Blade partials
- `site/plugins/` — Kirby plugins
- `site/config/config.php` — Main config (locale: de_DE, Sentry, sitemap, git-content)
- `app/Traits/` — Shared PHP traits (HasMainImage, HasSchema)
- `app/View/Components/` — Blade view components
- `content/` — Git-managed content files (Kirby's flat-file structure)

### Frontend
- `resources/css/site.css` — Main stylesheet (Tailwind 4 with FlyOnUI theme "TAP")
- `resources/js/site.js` — Main JS entry (Alpine.js, BigPicture gallery, AOS animations)
- `resources/js/fonts.js` — Font loader (Roboto via @fontsource)
- `public/build/` — Vite output (committed, built in CI)

Vite entry points are configured in `vite.config.js`. The HMR hot file is written to `storage/vite.hot`.

### Key Patterns
- Page models in `site/models/` extend Kirby's `Page` class and use traits from `app/Traits/`
- Blade templates use `@vite` directive to include CSS/JS assets
- Alpine.js handles interactivity (scroll animations via `@alpinejs/intersect`, image lightbox via BigPicture)
- Content is managed through Kirby's Panel and stored as flat files in `content/`

## Formatting

Prettier with plugins for PHP, Blade, and Tailwind class sorting. Config in `.prettierrc.json`:
- PHP: 4-space indent, 140 char width
- CSS/JS: 2-space indent

## Deployment

Push to `main` triggers GitHub Actions: pnpm install → pnpm build → auto-commit built assets → SSH deploy → `composer install --no-dev` on server → Sentry release.
