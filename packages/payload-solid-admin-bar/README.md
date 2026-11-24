# @rocksoliddigital/payload-solid-admin-bar

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

## Demo

A small Payload + Next.js site shows it in the admin, on the website and in Live Preview: see
[the repo](https://github.com/rock-solid/payload-solid-admin-bar#-try-the-demo).

## Install

```sh
pnpm add @rocksoliddigital/payload-solid-admin-bar
```

It needs Payload 3 and React 19.

## Admin

```ts
// payload.config.ts
import { adminBarPlugin } from '@rocksoliddigital/payload-solid-admin-bar/plugin';

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
import { AdminBar } from '@rocksoliddigital/payload-solid-admin-bar/site';

<AdminBar
  siteName="Example"
  collections={{ pages: { label: 'Page' }, posts: { label: 'Post' } }}
  preview={draftModeEnabled}
  onPreviewExit={() => fetch('/next/exit-preview').then(() => router.refresh())}
/>;
```

```tsx
// in each page: which document it shows, for the Edit link
import { AdminBarDocument } from '@rocksoliddigital/payload-solid-admin-bar/site';

<AdminBarDocument collection="pages" id={page.id} />;
```

The bar asks the CMS who is logged in (`/api/<users>/me`, then `/api/access`) from the browser, so
pages stay static and visitors get nothing. For a CMS on another origin, pass `cmsURL` and allow
the site in Payload's `cors` and `csrf`. Custom routes: `admin`, `api`, `account`, `logout`,
`userCollection`.

**Live Preview:** inside a frame, such as the admin's Live Preview pane, the bar renders nothing
and makes no requests, since the admin around it already has one. Pass `showInFrames` to show it
anyway.

## Multi-tenancy

With Payload's [multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant), the bar
names the tenant on screen (a location, a brand, a site) and keeps "+ New" in it.

```ts
// payload.config.ts
adminBarPlugin<Location>({
  siteName: 'Example',
  collections: {
    // `tenant` is the document's tenant, read once by the bar
    pages: { path: ({ doc, tenant }) => `/${tenant?.slug}/${doc.slug}` },
  },
  tenants: {
    collection: 'locations', // the plugin's tenantsSlug
    path: ({ tenant }) => `/${tenant.slug}`, // its home page; leave out for no link
  },
});
```

- **In the admin**, the bar shows the document's tenant on its edit screen, and the tenant
  selected in the admin elsewhere, linking to its home page. Its name is the tenants collection's
  `useAsTitle` field, or `tenants.label(tenant)`. Options: `field` (the tenant field, default
  `tenant`) and `cookie` (the selected tenant's cookie, default `payload-tenant`). `path` can return
  a full URL when each tenant has its own domain.
- **On the website**, tell the bar the page's tenant:

  ```tsx
  <AdminBarDocument
    collection="pages"
    id={page.id}
    tenant={{ id: location.id, label: location.name, href: `/${location.slug}` }}
  />
  ```

  The bar shows its name, and "+ New" sets the multi-tenant plugin's cookie to it, so a page
  created from a location's website starts in that location, whatever was selected in the admin.
  That needs the CMS on the site's origin; `tenantCookie` names the cookie, or `false` leaves it
  alone. A page without an `AdminBarDocument` (a listing, say) shows no tenant.

- **Tenants on their own domains** with one CMS: the website bar asks the CMS who is logged in from
  the tenant's domain. Browsers send Payload's login cookie (`SameSite=Lax`) only between sites on
  the same registrable domain (`cms.example.com` and `harbour.example.com`), so on separate domains
  the website bar can't see the login and stays hidden. The admin bar works either way.

## Styling

`styles.css` is imported by the components. Override the custom properties on `.solid-admin-bar`
(`--solid-admin-bar-bg`, `-fg`, `-hover-bg`, `-accent`, `-height`). `Bar` (from `/site`) is the
markup alone, for stories and custom wrappers.

## Not yet

- Globals (View/Edit for a global).
