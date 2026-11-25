import type { Payload } from 'payload';

export const DEMO_USER = { email: 'demo@example.com', password: 'demo' };
/** Works on Harbour only, so "My sites" and the admin's site picker list just Harbour. */
export const DEMO_EDITOR = { email: 'editor@example.com', password: 'demo' };

/**
 * Fills an empty database: a demo editor, two sites (tenants) with their pages, one page a draft,
 * and a shared post.
 */
export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({ collection: 'users' });
  if (totalDocs > 0) return;

  payload.logger.info(
    `Seeding the demo; log in as ${DEMO_USER.email} (every site) or ${DEMO_EDITOR.email} (Harbour), password ${DEMO_USER.password}`,
  );

  await payload.create({ collection: 'users', data: { ...DEMO_USER, roles: ['admin'] } });

  const main = await payload.create({ collection: 'sites', data: { name: 'Main', slug: 'main' } });
  const harbour = await payload.create({
    collection: 'sites',
    data: { name: 'Harbour', slug: 'harbour' },
  });
  await payload.create({
    collection: 'users',
    data: { ...DEMO_EDITOR, roles: ['editor'], tenants: [{ tenant: harbour.id }] },
  });
  const news = await payload.create({ collection: 'categories', data: { name: 'News' } });

  const pages = [
    {
      tenant: main.id,
      title: 'Welcome',
      slug: 'home',
      body: 'Log in at /admin and come back: the admin bar shows across the top of the site, with the site you are on. Open a page in the admin to see the same bar there, with a View link.',
    },
    {
      tenant: main.id,
      title: 'About',
      slug: 'about',
      body: 'A published page. On the website the bar links to its edit screen; in the admin the bar links back here.',
    },
    {
      tenant: harbour.id,
      title: 'Harbour',
      slug: 'home',
      body: 'Another site (tenant), under /harbour. The bar names it; "+ New" from here creates a page in Harbour, whatever site is selected in the admin.',
    },
    {
      tenant: harbour.id,
      title: 'Menu',
      slug: 'menu',
      body: 'A Harbour page. Its View link in the admin carries the /harbour prefix.',
    },
  ];
  for (const data of pages) {
    await payload.create({ collection: 'pages', data: { ...data, _status: 'published' } });
  }
  // Never published: no View link in the admin; Preview shows it in draft mode
  await payload.create({
    collection: 'pages',
    data: {
      tenant: main.id,
      title: 'Coming soon',
      slug: 'coming-soon',
      body: 'A draft.',
      _status: 'draft',
    },
    draft: true,
  });

  await payload.create({
    collection: 'posts',
    data: {
      title: 'Hello, world',
      slug: 'hello-world',
      excerpt: 'The first post, shared by every site.',
      body: 'Open this post in the admin and try Live Preview: the preview has no second bar.',
      category: news.id,
      _status: 'published',
    },
  });
};
