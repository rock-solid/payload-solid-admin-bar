import type { CollectionConfig, PayloadRequest } from 'payload';

import { loggedIn, publishedOrLoggedIn } from '../access';
import { pagePath, previewURL } from '../paths';

/** The slug of a page's site; the tenant field holds its id. */
const siteSlug = async (tenant: unknown, req: PayloadRequest) => {
  if (typeof tenant !== 'number' && typeof tenant !== 'string') return null;
  const site = await req.payload
    .findByID({ collection: 'sites', id: tenant, depth: 0, req })
    .catch(() => null);
  return site?.slug ?? null;
};

const pageURL = async (data: Record<string, unknown>, req: PayloadRequest) =>
  previewURL(pagePath(data, await siteSlug(data.tenant, req)));

/** Each belongs to a site (the multi-tenant plugin adds its `tenant` field). */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tenant', '_status'],
    livePreview: { url: async ({ data, req }) => (await pageURL(data, req)) ?? '/' },
    preview: (data, { req }) => pageURL(data, req),
  },
  versions: { drafts: { autosave: { interval: 300 } } },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar', description: '`home` is its site’s home page.' },
    },
    { name: 'body', type: 'textarea' },
  ],
};
