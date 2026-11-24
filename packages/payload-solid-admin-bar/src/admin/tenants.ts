import { parseCookies, type CollectionSlug, type Payload, type PayloadRequest } from 'payload';

import { siteHref } from '../links.js';
import {
  DEFAULT_TENANT_COOKIE,
  type AdminBarTenant,
  type AdminBarTenantsOptions,
} from '../plugin.js';

/** The field on documents that holds their tenant. */
export const tenantField = (tenants: AdminBarTenantsOptions) => tenants.field ?? 'tenant';

/** Whether the collection's documents have a tenant (the multi-tenant plugin's field). */
export const hasTenantField = (
  tenants: AdminBarTenantsOptions,
  payload: Payload,
  slug: CollectionSlug,
) => {
  const name = tenantField(tenants);
  return Boolean(
    payload.collections[slug]?.config.flattenedFields?.some((field) => field.name === name),
  );
};

/** A relationship value as an id: `3`, `'abc'`, `{ id: 3 }`, or the first of a hasMany list. */
export const relationID = (value: unknown): number | string | null => {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first === 'number' || typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'id' in first) {
    const { id } = first as { id: unknown };
    if (typeof id === 'number' || typeof id === 'string') return id;
  }
  return null;
};

/** A tenant read as the logged-in user, so one they may not see stays hidden. */
export const findTenant = async (
  tenants: AdminBarTenantsOptions,
  id: number | string | null,
  payload: Payload,
  req: PayloadRequest,
): Promise<AdminBarTenant | null> => {
  if (id === null || id === '') return null;

  try {
    const tenant = await payload.findByID({
      collection: tenants.collection,
      depth: 0,
      id,
      overrideAccess: false,
      req,
    });
    return (tenant as AdminBarTenant | null) ?? null;
  } catch {
    return null;
  }
};

/** The tenant selected in the admin, from the multi-tenant plugin's cookie. */
export const selectedTenantID = (
  tenants: AdminBarTenantsOptions,
  payload: Payload,
  req: PayloadRequest,
) => {
  const value = parseCookies(req.headers).get(tenants.cookie ?? DEFAULT_TENANT_COOKIE);
  if (!value) return null;
  // The cookie is text; a numeric id must be a number to match. The tenants collection's own id
  // type wins over the database's, as in the multi-tenant plugin.
  const idType = payload.collections[tenants.collection]?.customIDType ?? payload.db.defaultIDType;
  return idType === 'number' && /^\d+$/.test(value) ? Number(value) : value;
};

/** The tenant item: its name, linking to its home page when `tenants.path` gives one. */
export const tenantLink = async (
  tenants: AdminBarTenantsOptions,
  tenant: AdminBarTenant,
  payload: Payload,
  req: PayloadRequest,
  siteURL: string,
) => {
  const titleField = payload.collections[tenants.collection]?.config.admin?.useAsTitle;
  const title = titleField ? tenant[titleField] : undefined;
  const label =
    tenants.label?.(tenant) ||
    (typeof title === 'string' && title) ||
    (typeof title === 'number' && String(title)) ||
    String(tenant.id);

  const path = await tenants.path?.({ tenant, req });
  return { label, href: path ? siteHref(siteURL, path) : null };
};
