import type { CollectionConfig } from 'payload';

import { loggedIn } from '../access';

/** Has no page and isn't under "+ New" (`create: false` in the bar's options). */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { useAsTitle: 'name' },
  fields: [{ name: 'name', type: 'text', required: true }],
};
