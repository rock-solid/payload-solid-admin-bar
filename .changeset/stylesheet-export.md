---
'@rocksoliddigital/payload-solid-admin-bar': minor
---

The components no longer import their stylesheet, so they load in plain Node (e.g. integration tests). **Breaking:** import `@rocksoliddigital/payload-solid-admin-bar/styles.css` once in the website's root layout and in `app/(payload)/layout.tsx`
