import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Bar } from './Bar';

const tenants = [
  { id: 1, label: 'Global', href: '/' },
  { id: 2, label: 'Harbour', href: '/harbour' },
];
const user = { label: 'editor@example.com', account: '/admin/account', logout: '/admin/logout' };
const site = { label: 'Example', href: '/admin' };

// Keep the test page where it is when a link is followed
const stayOnPage = (event: Event) => event.preventDefault();

afterEach(() => {
  document.cookie = 'payload-tenant=; Max-Age=0; Path=/';
  document.removeEventListener('click', stayOnPage);
});

describe('My sites', () => {
  it('lists each tenant with Visit and Manage, marking the current one', async () => {
    render(
      <Bar
        site={site}
        tenant={{ id: 2, label: 'Harbour', href: '/harbour' }}
        tenantMenu={{ dashboard: '/admin', cookie: 'payload-tenant' }}
        tenants={tenants}
        user={user}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Harbour' }));
    expect(screen.getByRole('link', { name: 'Visit Global' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Manage Global' })).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Harbour', { selector: 'span' }).closest('li')).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('switches the admin to a tenant with Manage', async () => {
    document.addEventListener('click', stayOnPage);
    render(
      <Bar
        site={site}
        tenantMenu={{ dashboard: '/admin', cookie: 'payload-tenant' }}
        tenants={tenants}
        user={user}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'My sites' }));
    await userEvent.click(screen.getByRole('link', { name: 'Manage Harbour' }));
    expect(document.cookie).toContain('payload-tenant=2');
  });

  it('has no Manage without a cookie to set, and no menu for one tenant', () => {
    const { unmount } = render(
      <Bar
        site={site}
        tenantMenu={{ dashboard: '/admin', cookie: null }}
        tenants={tenants}
        user={user}
      />,
    );
    expect(screen.queryByRole('link', { name: /^Manage/ })).toBeNull();
    unmount();

    render(
      <Bar
        site={site}
        tenant={{ id: 2, label: 'Harbour', href: '/harbour' }}
        tenants={[tenants[1]!]}
        user={user}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Harbour' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Harbour' })).toHaveAttribute('href', '/harbour');
  });
});
