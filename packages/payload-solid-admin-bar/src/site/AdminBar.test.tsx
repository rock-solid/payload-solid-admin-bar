import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { AdminBar, AdminBarDocument, isFramed } from './AdminBar.js';

const respond = (routes: Record<string, unknown>) =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    const body = routes[url];
    return new Response(JSON.stringify(body ?? {}), { status: body === undefined ? 404 : 200 });
  });

const loggedIn = {
  '/api/users/me': { user: { email: 'editor@example.com' } },
  '/api/access': {
    collections: { pages: { create: true, update: true }, articles: { update: true } },
  },
};

const collections = { pages: { label: 'Page' }, articles: { label: 'Article' } };

// Vitest's browser mode runs each test file in an iframe, as Live Preview runs the site, so the
// tests that expect a bar pass `showInFrames`.

afterEach(() => vi.restoreAllMocks());

describe('AdminBar (website)', () => {
  it('shows nothing to visitors', async () => {
    const fetch = respond({ '/api/users/me': { user: null } });
    const { container } = render(
      <AdminBar collections={collections} showInFrames siteName="Example" />,
    );

    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    expect(fetch).not.toHaveBeenCalledWith('/api/access', expect.anything());
  });

  it('shows editors the dashboard, what they may create and their account', async () => {
    respond(loggedIn);
    render(<AdminBar collections={collections} showInFrames siteName="Example" />);

    expect(await screen.findByRole('link', { name: 'Example' })).toHaveAttribute('href', '/admin');
    await userEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(screen.getByRole('link', { name: 'Page' })).toHaveAttribute(
      'href',
      '/admin/collections/pages/create',
    );
    // Articles: update but not create
    expect(screen.queryByRole('link', { name: 'Article' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Log out' })).toHaveAttribute('href', '/admin/logout');
    expect(screen.queryByRole('button', { name: 'Exit preview' })).toBeNull();
  });

  it('links to the document the page shows', async () => {
    respond(loggedIn);
    render(
      <>
        <AdminBar collections={collections} showInFrames siteName="Example" />
        <AdminBarDocument collection="articles" id={7} />
      </>,
    );

    expect(await screen.findByRole('link', { name: 'Edit article' })).toHaveAttribute(
      'href',
      '/admin/collections/articles/7',
    );
  });

  it('offers Exit preview in draft mode', async () => {
    respond(loggedIn);
    const onPreviewExit = vi.fn();
    render(
      <AdminBar
        collections={collections}
        onPreviewExit={onPreviewExit}
        preview
        showInFrames
        siteName="Example"
      />,
    );

    (await screen.findByRole('button', { name: 'Exit preview' })).click();
    expect(onPreviewExit).toHaveBeenCalledOnce();
  });

  it('stays hidden in a frame, as in Live Preview, and asks no one who is logged in', async () => {
    expect(isFramed()).toBe(true);
    const fetch = respond(loggedIn);
    const { container } = render(<AdminBar collections={collections} preview siteName="Example" />);

    // Give a fetch, had one started, the time to answer
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetch).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });
});
