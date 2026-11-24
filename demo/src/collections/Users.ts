import type { CollectionConfig } from 'payload';

/**
 * Admins work on every site; editors only on the sites in their `tenants` array (added by the
 * multi-tenant plugin).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'roles'] },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
};

/** Whether the user works on every site. */
export const isAdmin = (user: unknown) =>
  Boolean((user as { roles?: string[] | null } | null)?.roles?.includes('admin'));
