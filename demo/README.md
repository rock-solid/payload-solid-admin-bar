# Demo

A small Payload + Next.js site that uses `@rocksoliddigital/payload-solid-admin-bar` from the workspace, built, as npm installs it. Run it from the repo root with `pnpm demo`, which
builds the package first; after changing the package, run `pnpm build` again. See the root README for
what to try.

- `src/payload.config.ts`: the plugin's options (admin side), with `tenants` for the sites that
  Payload's multi-tenant plugin adds.
- `src/components/SiteAdminBar.tsx`: the website bar.
- `src/components/Document.tsx`: `AdminBarDocument` for the Edit link, with the page's site.
- `src/app/(site)/[[...segments]]`: the main site at `/`, other sites under their slug.
- `src/app/(site)/next/preview`: draft mode for logged-in editors, used by Preview and Live Preview.
