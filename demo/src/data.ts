import config from '@payload-config';
import { draftMode } from 'next/headers';
import { type DataFromCollectionSlug, getPayload, type Where } from 'payload';

import type { Site } from '@/payload-types';
import { MAIN_SITE } from '@/paths';

/** One published document by slug, or its latest draft in draft mode. */
export const findBySlug = async (
  collection: 'pages' | 'posts',
  slug: string,
  site?: Site | null,
) => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config });
  const where: Where = { slug: { equals: slug } };
  // A page belongs to a site
  if (site) where.tenant = { equals: site.id };

  const { docs } = await payload.find({
    collection,
    depth: 0,
    draft,
    limit: 1,
    // /next/preview turns draft mode on only for a logged-in editor
    overrideAccess: draft,
    where,
  });
  return { doc: docs[0] ?? null, draft };
};

export const listSites = async () => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'sites', limit: 50, sort: 'name' });
  return docs;
};

export const findSite = async (slug: string) =>
  (await listSites()).find((site) => site.slug === slug) ?? null;

export const mainSite = () => findSite(MAIN_SITE);

export const listPublished = async <T extends 'pages' | 'posts'>(collection: T, site?: Site) => {
  const payload = await getPayload({ config });
  const where: Where = { _status: { equals: 'published' } };
  if (site) where.tenant = { equals: site.id };

  const { docs } = await payload.find({ collection, depth: 0, limit: 50, sort: 'title', where });
  return docs as DataFromCollectionSlug<T>[];
};
