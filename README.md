# payload-solid-admin-bar

[![npm](https://img.shields.io/npm/v/@rocksoliddigital/payload-solid-admin-bar)](https://www.npmjs.com/package/@rocksoliddigital/payload-solid-admin-bar)

A WordPress-style admin bar for [Payload CMS](https://payloadcms.com). The same dark strip shows
across the top of every admin screen and, for logged-in editors, across the top of the website:

|         | In the admin                                    | On the website                       |
| ------- | ----------------------------------------------- | ------------------------------------ |
| Site    | Site name → the website (new tab)               | Site name → the admin dashboard      |
| Current | **View page** on a published document's screen  | **Edit page** for the document shown |
| Create  | **+ New** → the collections the user may create | same                                 |
| Preview | —                                               | **Exit preview** in draft mode       |
| User    | Email → account, **Log out**                    | same                                 |

Payload's own `@payloadcms/admin-bar` covers only the website side, for one collection.

## 📦 Package

[`@rocksoliddigital/payload-solid-admin-bar`](packages/payload-solid-admin-bar): install it and
set it up as [its README](packages/payload-solid-admin-bar#readme) shows.

## 🚀 Try the demo

```sh
git clone https://github.com/rock-solid/payload-solid-admin-bar.git
cd payload-solid-admin-bar
pnpm install
pnpm demo        # http://localhost:3100
```

The demo is a small Payload + Next.js site in [`demo/`](demo) on SQLite, so it needs no database
server or `.env` (copy `demo/.env.example` to change the secrets). An empty database is seeded on
start: log in at <http://localhost:3100/admin> as `demo@example.com` / `demo`, then:

- open **About** in the admin: the bar has **View page**; the site's bar has **Edit page**;
- open **Coming soon** (a draft): no **View page**; its Preview opens the site in draft mode with
  **Exit preview**;
- open **Live Preview** on any page or post: the preview shows the site without a second bar.

## 🧰 Development

```sh
pnpm install
pnpm check   # format, lint, typecheck (package + demo), tests, package and demo builds
```

Component tests run in Chromium through Vitest's browser mode; the first time, run
`pnpm exec playwright install chromium`. Releases go through Changesets: a PR that changes the
package adds one with `pnpm changeset`, and the Release workflow publishes the Version Packages PR.

Report security issues privately: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
