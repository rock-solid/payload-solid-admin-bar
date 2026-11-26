import type { CollectionConfig } from 'payload';

import { loggedIn } from '../access';

/**
 * The tenants (Payload's multi-tenant plugin): one website each, on one domain. The main site is
 * at the root, the others under their slug (`/harbour`).
 */
export const Sites: CollectionConfig = {
  slug: 'sites',
  labels: { singular: 'Site', plural: 'Sites' },
  access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '`main` is the site at the root; others live under their slug.' },
    },
  ],
};
