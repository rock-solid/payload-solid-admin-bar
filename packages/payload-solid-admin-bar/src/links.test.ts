import { describe, expect, it } from 'vitest';

import { adminLinks, labelText, siteHref } from './links.js';

describe('adminLinks', () => {
  it('builds same-origin links with Payload’s default routes', () => {
    const links = adminLinks();

    expect(links.dashboard).toBe('/admin');
    expect(links.account).toBe('/admin/account');
    expect(links.logout).toBe('/admin/logout');
    expect(links.create('team-members')).toBe('/admin/collections/team-members/create');
    expect(links.edit('pages', 10)).toBe('/admin/collections/pages/10');
    expect(links.me('users')).toBe('/api/users/me');
    expect(links.access).toBe('/api/access');
  });

  it('follows a CMS on another origin and custom routes', () => {
    const links = adminLinks({
      cmsURL: 'https://cms.example.com/',
      admin: '/cms',
      api: '/rest',
      logout: '/sign-out',
    });

    expect(links.dashboard).toBe('https://cms.example.com/cms');
    expect(links.logout).toBe('https://cms.example.com/cms/sign-out');
    expect(links.me('editors')).toBe('https://cms.example.com/rest/editors/me');
  });

  it('encodes ids and slugs', () => {
    expect(adminLinks().edit('pages', 'a/b c')).toBe('/admin/collections/pages/a%2Fb%20c');
  });

  it('keeps a root admin route', () => {
    expect(adminLinks({ admin: '/' }).dashboard).toBe('/');
  });
});

describe('siteHref', () => {
  it.each([
    ['https://example.com', '/', 'https://example.com/'],
    ['https://example.com/', '/news/x', 'https://example.com/news/x'],
    ['/', '/services', '/services'],
    ['https://example.com', 'https://other.example/x', 'https://other.example/x'],
    ['https://example.com', 'javascript:alert(1)', null],
    ['https://example.com', 'JavaScript:alert(1)', null],
    ['https://example.com', 'data:text/html,x', null],
    ['javascript:alert(1)//', '/', null],
  ])('%s + %s → %s', (siteURL, path, expected) => {
    expect(siteHref(siteURL, path)).toBe(expected);
  });

  // CodeQL's case: a long run of '/' followed by something else made /\/+$/ backtrack (~3.5s)
  it('handles long runs of slashes in linear time', () => {
    const slashes = '/'.repeat(100_000);
    const started = performance.now();

    expect(siteHref(`https://example.com/a${slashes}x`, 'b')).toBe(
      `https://example.com/a${slashes}x/b`,
    );
    expect(adminLinks({ cmsURL: 'https://cms.example.com', admin: `a${slashes}x` }).dashboard).toBe(
      `https://cms.example.com/a${slashes}x`,
    );
    expect(performance.now() - started).toBeLessThan(100);
  });
});

describe('labelText', () => {
  it('reads every label Payload allows', () => {
    expect(labelText('Page', 'x')).toBe('Page');
    expect(labelText({ en: 'Page', de: 'Seite' }, 'x', { language: 'de' })).toBe('Seite');
    expect(labelText({ en: 'Page' }, 'x', { language: 'fr' })).toBe('Page');
    expect(labelText(() => 'Post', 'x')).toBe('Post');
    expect(labelText(undefined, 'pages')).toBe('pages');
    expect(labelText(false, 'pages')).toBe('pages');
  });
});
