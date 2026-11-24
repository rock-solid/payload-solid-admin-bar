# payload-solid-admin-bar

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

## Try the demo

```sh
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

## Install

Not on npm yet. In a pnpm workspace, add it as a workspace package; Next.js needs
`transpilePackages: ['payload-solid-admin-bar']` while it ships TypeScript source.

## Admin

```ts
// payload.config.ts
import { adminBarPlugin } from 'payload-solid-admin-bar/plugin';

plugins: [
  adminBarPlugin({
    siteName: 'Example',
    // Leave siteURL out when the site and the admin share an origin; set it, or
    // ({ req, payload }) => tenant domain, when the website lives elsewhere
    collections: {
      pages: { path: ({ doc }) => (doc.slug === 'home' ? '/' : `/${doc.slug}`) },
      posts: { path: ({ doc }) => `/posts/${doc.slug}` },
      categories: { create: false },
    },
  }),
];
```

Then run `payload generate:importmap`. The bar goes in `admin.components.header`, so it sits above
Payload's own header and scrolls away with it (Payload has many `position: sticky` elements that a
fixed bar would cover).

- **View** appears on a document's edit screen when its collection has a `path` and the document
  is published. The document is read as the logged-in user (`overrideAccess: false`).
- **+ New** lists the collections in `collections`, minus `create: false` and those the user may
  not create.
- **siteURL**: leave it out when the website and the admin share an origin, so the links stay
  relative and follow whatever domain the editor is on (preview deploys included). A fixed URL
  sends every environment to that domain. It may be a function of the request: a multi-tenant
  site can return the selected tenant's domain. Defaults to the config's `serverURL`.

## Website

```tsx
// a client wrapper in the site's layout, so it can pass onPreviewExit
'use client';
import { AdminBar } from 'payload-solid-admin-bar/site';

<AdminBar
  siteName="Example"
  collections={{ pages: { label: 'Page' }, posts: { label: 'Post' } }}
  preview={draftModeEnabled}
  onPreviewExit={() => fetch('/next/exit-preview').then(() => router.refresh())}
/>;
```

```tsx
// in each page: which document it shows, for the Edit link
import { AdminBarDocument } from 'payload-solid-admin-bar/site';

<AdminBarDocument collection="pages" id={page.id} />;
```

The bar asks the CMS who is logged in (`/api/<users>/me`, then `/api/access`) from the browser, so
pages stay static and visitors get nothing. For a CMS on another origin, pass `cmsURL` and allow
the site in Payload's `cors` and `csrf`. Custom routes: `admin`, `api`, `account`, `logout`,
`userCollection`.

**Live Preview:** inside a frame, such as the admin's Live Preview pane, the bar renders nothing
and makes no requests, since the admin around it already has one. Pass `showInFrames` to show it
anyway.

## Styling

`styles.css` is imported by the components. Override the custom properties on `.solid-admin-bar`
(`--solid-admin-bar-bg`, `-fg`, `-hover-bg`, `-accent`, `-height`). `Bar` (from `/site`) is the
markup alone, for stories and custom wrappers.

## Development

```sh
pnpm check   # format, lint, typecheck (package + demo), tests, build
```

Component tests run in Chromium through Vitest's browser mode; the first time, run
`pnpm exec playwright install chromium`.

## Not yet

- Publishing to npm (`publishConfig.exports` already points at `dist/`).
- Multi-tenancy beyond `siteURL`: showing the tenant, and a website bar per tenant.
- Globals (View/Edit for a global).
