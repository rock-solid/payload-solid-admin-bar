import type { CollectionConfig } from 'payload';

import { loggedIn, publishedOrLoggedIn } from '../access';
import { postPath, previewURL } from '../paths';

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    livePreview: { url: ({ data }) => previewURL(postPath(data)) ?? '/' },
    preview: (data) => previewURL(postPath(data)),
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
      admin: { position: 'sidebar' },
    },
    { name: 'excerpt', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
  ],
};
