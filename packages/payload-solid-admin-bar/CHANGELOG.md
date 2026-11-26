# @rocksoliddigital/payload-solid-admin-bar

## 0.3.0

### 🚀 Features

- The components no longer import their stylesheet, so they load in plain Node (e.g. integration tests). **Breaking:** import `@rocksoliddigital/payload-solid-admin-bar/styles.css` once in the website's root layout and in `app/(payload)/layout.tsx` ([#6](https://github.com/rock-solid/payload-solid-admin-bar/pull/6)) ([c6051df](https://github.com/rock-solid/payload-solid-admin-bar/commit/c6051df60335a03125977a312f955bb1410fc495))

### 🤝 Contributors

- Adrian Cando (@godhand1607)

## 0.2.0

### 🚀 Features

- Multi-tenancy with Payload's multi-tenant plugin: a `tenants` option names the tenant on screen and links to its home page, each `path` gets the document's tenant, and on the website `AdminBarDocument`'s `tenant` makes "+ New" create documents in the page's tenant ([#3](https://github.com/rock-solid/payload-solid-admin-bar/pull/3)) ([75c39e0](https://github.com/rock-solid/payload-solid-admin-bar/commit/75c39e02887d5f345ee2482dcff81e8dab0aa41c))

### 🤝 Contributors

- Adrian Cando (@godhand1607)

## 0.1.0

### 🚀 Features

- First release: a WordPress-style admin bar for Payload CMS, in the admin and on the website, hidden inside Live Preview ([#1](https://github.com/rock-solid/payload-solid-admin-bar/pull/1)) ([7afa0c9](https://github.com/rock-solid/payload-solid-admin-bar/commit/7afa0c9779ef76cb7eff35fb6d343bc5dcf621e3))

### 🤝 Contributors

- Adrian Cando (@godhand1607)
