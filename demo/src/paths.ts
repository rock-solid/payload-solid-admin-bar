import { PREVIEW_SECRET } from './site';

/** The site at the root; every other site lives under its slug, e.g. `/harbour`. */
export const MAIN_SITE = 'main';

/** A site's URL prefix: '' for the main site, `/harbour` for another. */
export const sitePrefix = (siteSlug?: string | null) =>
  !siteSlug || siteSlug === MAIN_SITE ? '' : `/${siteSlug}`;

/** A site's home page. */
export const siteHome = (siteSlug?: string | null) => sitePrefix(siteSlug) || '/';

/** A page's path on its site: `/about`, `/harbour`, `/harbour/menu`. */
export const pagePath = (doc: { slug?: string | null }, siteSlug?: string | null) => {
  if (!doc.slug) return null;
  return doc.slug === 'home' ? siteHome(siteSlug) : `${sitePrefix(siteSlug)}/${doc.slug}`;
};

export const postPath = (doc: { slug?: string | null }) => (doc.slug ? `/posts/${doc.slug}` : null);

/** Through /next/preview, which turns on draft mode for a logged-in editor. */
export const previewURL = (path: string | null) =>
  path ? `/next/preview?${new URLSearchParams({ path, previewSecret: PREVIEW_SECRET })}` : null;
