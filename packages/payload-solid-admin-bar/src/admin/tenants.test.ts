import type { Payload, PayloadRequest } from 'payload';
import { describe, expect, it, vi } from 'vitest';

import { tenantsEndpoint } from './endpoint';
import { listUserTenants } from './tenants';

const find = vi.fn(async ({ where }: { where?: { id?: { in?: unknown[] } } }) => {
  const all = [
    { id: 1, name: 'Global', slug: 'global' },
    { id: 2, name: 'Harbour', slug: 'harbour' },
    { id: 3, name: 'Hilltop', slug: 'hilltop' },
  ];
  const ids = where?.id?.in;
  return { docs: ids ? all.filter((tenant) => ids.includes(tenant.id)) : all };
});

const payload = {
  config: { serverURL: '' },
  collections: { locations: { config: { admin: { useAsTitle: 'name' } } } },
  find,
} as unknown as Payload;

const tenants = {
  collection: 'locations' as never,
  userHasAccessToAllTenants: (user: { roles?: string[] }) => Boolean(user.roles?.includes('admin')),
  path: ({ tenant }: { tenant: { slug?: unknown } }) =>
    tenant.slug === 'global' ? '/' : `/${String(tenant.slug)}`,
} as never;

const reqFor = (user: unknown) => ({ user, payload }) as unknown as PayloadRequest;

describe('listUserTenants', () => {
  it('lists every tenant for a user with access to all, by name, as the user', async () => {
    const list = await listUserTenants(tenants, payload, reqFor({ roles: ['admin'] }), '/');

    expect(find).toHaveBeenLastCalledWith(
      expect.objectContaining({ collection: 'locations', overrideAccess: false, sort: 'name' }),
    );
    expect(find.mock.lastCall?.[0]).not.toHaveProperty('where');
    expect(list).toEqual([
      { id: 1, label: 'Global', href: '/' },
      { id: 2, label: 'Harbour', href: '/harbour' },
      { id: 3, label: 'Hilltop', href: '/hilltop' },
    ]);
  });

  it('lists only the tenants in an editor’s array, ids or populated', async () => {
    const editor = { roles: ['editor'], tenants: [{ tenant: 2 }, { tenant: { id: 3 } }] };

    const list = await listUserTenants(tenants, payload, reqFor(editor), '/');

    expect(list.map((tenant) => tenant.label)).toEqual(['Harbour', 'Hilltop']);
  });

  it('lists nothing for an editor without tenants, or no user', async () => {
    find.mockClear();

    expect(await listUserTenants(tenants, payload, reqFor({ tenants: [] }), '/')).toEqual([]);
    expect(await listUserTenants(tenants, payload, reqFor(null), '/')).toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });

  it('reads custom array field names', async () => {
    const custom = {
      ...(tenants as object),
      arrayField: 'sites',
      arrayTenantField: 'site',
    } as never;

    const list = await listUserTenants(custom, payload, reqFor({ sites: [{ site: 1 }] }), '/');

    expect(list.map((tenant) => tenant.id)).toEqual([1]);
  });
});

describe('tenantsEndpoint', () => {
  const endpoint = tenantsEndpoint({ tenants });

  it('is GET /admin-bar/tenants', () => {
    expect(endpoint).toMatchObject({ method: 'get', path: '/admin-bar/tenants' });
  });

  it('answers 401 without a user', async () => {
    const res = await endpoint.handler(reqFor(null));

    expect(res.status).toBe(401);
  });

  it('lists the user’s tenants', async () => {
    const res = await endpoint.handler(reqFor({ tenants: [{ tenant: 2 }] }));

    expect(await res.json()).toEqual({ tenants: [{ id: 2, label: 'Harbour', href: '/harbour' }] });
  });
});
