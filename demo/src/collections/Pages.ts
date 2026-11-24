import type { CollectionConfig } from 'payload';

import { loggedIn, publishedOrLoggedIn } from '../access';
import { pagePath, previewURL } from '../paths';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    livePreview: { url: ({ data }) => previewURL(pagePath(data)) ?? '/' },
    preview: (data) => previewURL(pagePath(data)),
  },
  versions: { drafts: { autosave: { interval: 300 } } },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '`home` is the home page.' },
    },
    { name: 'body', type: 'textarea' },
  ],
};
