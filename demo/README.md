# Demo

A small Payload + Next.js site that uses `@rocksoliddigital/payload-solid-admin-bar` from the workspace, built, as npm installs it. Run it from the repo root with `pnpm demo`, which
builds the package first; after changing the package, run `pnpm build` again. See the root README for
what to try.

- `src/payload.config.ts`: the plugin's options (admin side).
- `src/components/SiteAdminBar.tsx`: the website bar.
- `src/components/Document.tsx`: `AdminBarDocument` for the Edit link.
- `src/app/(site)/next/preview`: draft mode for logged-in editors, used by Preview and Live Preview.
