import type { Endpoint } from 'payload';

import { TENANTS_ENDPOINT } from '../constants.js';
import type { AdminBarPluginOptions } from '../plugin.js';
import { resolveSiteURL } from './site.js';
import { listUserTenants } from './tenants.js';

/**
 * `GET /api/admin-bar/tenants`: the tenants the logged-in user may work on, with their names and
 * home pages, for the website's "My sites". The same list as the admin's bar.
 */
export const tenantsEndpoint = (options: AdminBarPluginOptions): Endpoint => ({
  path: TENANTS_ENDPOINT,
  method: 'get',
  handler: async (req) => {
    const { tenants } = options;
    if (!req.user) return Response.json({ tenants: [] }, { status: 401 });
    if (!tenants) return Response.json({ tenants: [] });

    const siteURL = await resolveSiteURL(options.siteURL, req.payload, req);
    return Response.json({ tenants: await listUserTenants(tenants, req.payload, req, siteURL) });
  },
});
