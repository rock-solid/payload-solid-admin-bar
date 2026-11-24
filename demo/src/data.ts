import config from '@payload-config';
import { draftMode } from 'next/headers';
import { type DataFromCollectionSlug, getPayload } from 'payload';

/** One published document by slug, or its latest draft in draft mode. */
export const findBySlug = async (collection: 'pages' | 'posts', slug: string) => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection,
    draft,
    limit: 1,
    // /next/preview turns draft mode on only for a logged-in editor
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  });
  return { doc: docs[0] ?? null, draft };
};

export const listPublished = async <T extends 'pages' | 'posts'>(collection: T) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection,
    limit: 50,
    sort: 'title',
    where: { _status: { equals: 'published' } },
  });
  return docs as DataFromCollectionSlug<T>[];
};
