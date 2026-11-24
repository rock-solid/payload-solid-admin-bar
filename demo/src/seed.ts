import type { Payload } from 'payload';

export const DEMO_USER = { email: 'demo@example.com', password: 'demo' };

/** Fills an empty database: a demo editor, a few pages and posts, one of them a draft. */
export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({ collection: 'users' });
  if (totalDocs > 0) return;

  payload.logger.info(`Seeding the demo; log in as ${DEMO_USER.email} / ${DEMO_USER.password}`);

  await payload.create({ collection: 'users', data: DEMO_USER });

  const news = await payload.create({ collection: 'categories', data: { name: 'News' } });

  const pages = [
    {
      title: 'Welcome',
      slug: 'home',
      body: 'Log in at /admin and come back: the admin bar shows across the top of the site. Open a page in the admin to see the same bar there, with a View link.',
    },
    {
      title: 'About',
      slug: 'about',
      body: 'A published page. On the website the bar links to its edit screen; in the admin the bar links back here.',
    },
  ];
  for (const data of pages) {
    await payload.create({ collection: 'pages', data: { ...data, _status: 'published' } });
  }
  // Never published: no View link in the admin; Preview shows it in draft mode
  await payload.create({
    collection: 'pages',
    data: { title: 'Coming soon', slug: 'coming-soon', body: 'A draft.', _status: 'draft' },
    draft: true,
  });

  await payload.create({
    collection: 'posts',
    data: {
      title: 'Hello, world',
      slug: 'hello-world',
      excerpt: 'The first post.',
      body: 'Open this post in the admin and try Live Preview: the preview has no second bar.',
      category: news.id,
      _status: 'published',
    },
  });
};
