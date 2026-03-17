# Talk am Pegel

![Deploy to Live](https://github.com/derteaser/talk-am-pegel-site/workflows/Deploy%20to%20Live/badge.svg)

Event showcase website for **Talk am Pegel** — built with [Kirby CMS](https://getkirby.com), [Tailwind CSS](https://tailwindcss.com), [Alpine.js](https://alpinejs.dev), and [Vite](https://vite.dev).

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| CMS       | Kirby 3 (flat-file, PHP 8.2/8.3)               |
| Templates | Laravel Blade (via kirby-blade)                 |
| Styling   | Tailwind CSS 4, FlyOnUI                         |
| JS        | Alpine.js 3, BigPicture (lightbox)              |
| Build     | Vite 8, pnpm                                    |
| Icons     | Remix Icon                                      |
| Analytics | Fathom Analytics                                |
| Errors    | Sentry                                          |

## Prerequisites

- PHP 8.2 or 8.3
- [Composer](https://getcomposer.org)
- Node.js 24
- [pnpm](https://pnpm.io) 10

## Setup

```bash
# Install dependencies
composer install
pnpm install

# Copy and configure environment
cp .env.ci .env
# Edit .env with your local settings (APP_URL, APP_DEBUG, etc.)
```

## Development

Run both servers simultaneously:

```bash
# Terminal 1 — PHP server
composer start

# Terminal 2 — Vite dev server (HMR)
pnpm dev
```

The site is then available at `http://localhost:8000`. Kirby Panel is at `/panel`.

For local TLS, configure the domain `talk-am-pegel.test`.

## Production Build

```bash
pnpm build
```

Output goes to `public/build/`.

## Formatting

```bash
pnpm prettier --write .
```

Uses Prettier with plugins for PHP, Blade templates, and Tailwind class sorting. See `.prettierrc.json` for details.

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that:

1. Installs dependencies and runs `pnpm build`
2. Auto-commits built assets
3. Deploys to the server via SSH (`git pull` + `composer install --no-dev`)
4. Creates a Sentry release

## License

MIT
