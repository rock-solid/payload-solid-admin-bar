import { PREVIEW_SECRET } from './site';

/** Each document's page on the demo site; the admin bar's View link and Live Preview use them. */
export const pagePath = (doc: { slug?: string | null }) =>
  doc.slug ? (doc.slug === 'home' ? '/' : `/${doc.slug}`) : null;

export const postPath = (doc: { slug?: string | null }) => (doc.slug ? `/posts/${doc.slug}` : null);

/** Through /next/preview, which turns on draft mode for a logged-in editor. */
export const previewURL = (path: string | null) =>
  path ? `/next/preview?${new URLSearchParams({ path, previewSecret: PREVIEW_SECRET })}` : null;
