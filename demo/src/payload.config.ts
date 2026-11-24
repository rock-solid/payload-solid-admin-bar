import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { buildConfig } from 'payload';
import { adminBarPlugin } from 'payload-solid-admin-bar/plugin';

import { Categories } from './collections/Categories';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Users } from './collections/Users';
import { pagePath, postPath } from './paths';
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
  collections: [Pages, Posts, Categories, Users],
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URL || 'file:./demo.db' } }),
  secret: process.env.PAYLOAD_SECRET || 'demo-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: [
    adminBarPlugin({
      siteName: SITE_NAME,
      // No siteURL: the site and the admin share an origin, so the links stay relative
      collections: {
        pages: { path: ({ doc }) => pagePath(doc) },
        posts: { path: ({ doc }) => postPath(doc) },
        categories: { create: false },
      },
    }),
  ],
  onInit: seed,
});
