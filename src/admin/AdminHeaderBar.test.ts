import type { Payload, PayloadRequest } from 'payload';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { BarProps } from '../Bar';
import { AdminHeaderBar } from './AdminHeaderBar';

const findByID = vi.fn();

const payload = {
  config: {
    serverURL: '',
    routes: { admin: '/admin', api: '/api' },
    admin: { routes: { account: '/account', logout: '/logout' } },
  },
  collections: {
    pages: { config: { labels: { singular: 'Page' } } },
    articles: { config: { labels: { singular: { en: 'Article', de: 'Artikel' } } } },
  },
  findByID,
} as unknown as Payload;

const req = {} as PayloadRequest;
const user = { id: 1, email: 'editor@example.com' };

const props = async (extra: Partial<Parameters<typeof AdminHeaderBar>[0]> = {}) => {
  const element = (await AdminHeaderBar({
    adminBar: {
      siteName: 'Example',
      siteURL: 'https://example.com',
      // `missing` isn't a collection of this config, so it's outside the typed slugs
      collections: {
        pages: { path: ({ doc }: { doc: { slug?: string } }) => `/${doc.slug}` },
        articles: { create: false },
        missing: {},
      } as never,
    },
    payload,
    permissions: {
      collections: { pages: { create: true }, articles: { create: true } },
    } as never,
    req,
    user: user as never,
    ...extra,
  })) as React.ReactElement<BarProps> | null;

  return element?.props;
};

describe('AdminHeaderBar', () => {
  it('renders nothing when no one is logged in', async () => {
    expect(await props({ user: null })).toBeUndefined();
  });

  it('links to the website, the user’s account and the collections they may create', async () => {
    const bar = await props();

    expect(bar?.site).toEqual({ label: 'Example', href: 'https://example.com/' });
    expect(bar?.siteInNewTab).toBe(true);
    // articles is `create: false`; missing isn't a collection
    expect(bar?.create).toEqual([{ label: 'Page', href: '/admin/collections/pages/create' }]);
    expect(bar?.user).toEqual({
      label: 'editor@example.com',
      account: '/admin/account',
      logout: '/admin/logout',
    });
    expect(bar?.current).toBeNull();
  });

  it('leaves out what the user may not create', async () => {
    const bar = await props({ permissions: { collections: {} } as never });

    expect(bar?.create).toEqual([]);
  });

  it('links to the document’s page on its edit screen', async () => {
    findByID.mockResolvedValueOnce({ id: 10, slug: 'services', _status: 'published' });

    const bar = await props({ collectionSlug: 'pages', docID: 10 });

    expect(findByID).toHaveBeenLastCalledWith(
      expect.objectContaining({ collection: 'pages', id: 10, draft: false, overrideAccess: false }),
    );
    expect(bar?.current).toEqual({ label: 'View page', href: 'https://example.com/services' });
  });

  it('has no View link for a document never published, or one it can’t read', async () => {
    findByID.mockResolvedValueOnce({ id: 11, slug: 'draft', _status: 'draft' });
    expect((await props({ collectionSlug: 'pages', docID: 11 }))?.current).toBeNull();

    findByID.mockRejectedValueOnce(new Error('Forbidden'));
    expect((await props({ collectionSlug: 'pages', docID: 12 }))?.current).toBeNull();
  });

  it('names the View link in the admin’s language', async () => {
    findByID.mockResolvedValueOnce({ id: 3, slug: 'news', _status: 'published' });

    const bar = await props({
      adminBar: { collections: { articles: { path: () => '/media/news' } } as never },
      collectionSlug: 'articles',
      docID: 3,
      i18n: { language: 'de' },
    });

    expect(bar?.current?.label).toBe('View artikel');
  });

  it('drops a View link that isn’t http(s)', async () => {
    findByID.mockResolvedValueOnce({ id: 4, slug: 'x', _status: 'published' });

    const bar = await props({
      adminBar: { collections: { pages: { path: () => 'javascript:alert(1)' } } as never },
      collectionSlug: 'pages',
      docID: 4,
    });

    expect(bar?.current).toBeNull();
  });

  it('has no View link for a collection without a path', async () => {
    findByID.mockClear();

    expect((await props({ collectionSlug: 'articles', docID: 1 }))?.current).toBeNull();
    expect(findByID).not.toHaveBeenCalled();
  });

  it('keeps links relative without a siteURL, so they follow the domain the editor is on', async () => {
    findByID.mockResolvedValueOnce({ id: 10, slug: 'services', _status: 'published' });

    const bar = await props({
      adminBar: {
        siteName: 'Example',
        collections: { pages: { path: () => '/services' } } as never,
      },
      collectionSlug: 'pages',
      docID: 10,
    });

    expect(bar?.site.href).toBe('/');
    expect(bar?.current?.href).toBe('/services');
  });

  it('asks a siteURL function, for the tenant’s domain, and names the site after its host', async () => {
    const siteURL = vi.fn(async () => 'https://tenant.example.org');

    const bar = await props({ adminBar: { siteURL } });

    expect(siteURL).toHaveBeenCalledWith({ payload, req });
    expect(bar?.site).toEqual({ label: 'tenant.example.org', href: 'https://tenant.example.org/' });
  });
});
