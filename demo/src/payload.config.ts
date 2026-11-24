import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { buildConfig } from 'payload';
import { adminBarPlugin } from '@rocksoliddigital/payload-solid-admin-bar/plugin';

import { Categories } from './collections/Categories';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Sites } from './collections/Sites';
import { Users } from './collections/Users';
import type { Config, Site } from './payload-types';
import { pagePath, postPath, siteHome } from './paths';
import { seed } from './seed';
import { SITE_NAME } from './site';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 800 },
      ],
    },
  },
  collections: [Pages, Posts, Categories, Sites, Users],
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URL || 'file:./demo.db' } }),
  secret: process.env.PAYLOAD_SECRET || 'demo-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: [
    adminBarPlugin<Site>({
      siteName: SITE_NAME,
      // No siteURL: the site and the admin share an origin, so the links stay relative
      collections: {
        // Pages carry their site's prefix: /harbour/menu
        pages: { path: ({ doc, tenant }) => pagePath(doc, tenant?.slug) },
        posts: { path: ({ doc }) => postPath(doc) },
        categories: { create: false },
      },
      // The site on screen, next to the site name, linking to its home page
      tenants: { collection: 'sites', path: ({ tenant }) => siteHome(tenant.slug) },
    }),
    // Pages belong to a site; posts and categories are shared
    multiTenantPlugin<Config>({
      tenantsSlug: 'sites',
      collections: { pages: {} },
      userHasAccessToAllTenants: () => true,
    }),
  ],
  onInit: seed,
});
