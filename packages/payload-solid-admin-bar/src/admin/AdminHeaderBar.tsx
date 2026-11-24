import {
  parseCookies,
  type CollectionSlug,
  type Payload,
  type PayloadRequest,
  type SanitizedPermissions,
  type TypedUser,
} from 'payload';
import type React from 'react';

import { Bar, type BarLink } from '../Bar.js';
import { adminLinks, labelText, siteHref, type PayloadLabel } from '../links.js';
import {
  DEFAULT_TENANT_COOKIE,
  type AdminBarPluginOptions,
  type AdminBarTenant,
  type AdminBarTenantsOptions,
} from '../plugin.js';

type Props = {
  adminBar?: Omit<AdminBarPluginOptions, 'enabled'>;
  // From Payload's default template
  collectionSlug?: string;
  docID?: number | string;
  i18n?: { language?: string; t?: unknown };
  payload: Payload;
  permissions?: SanitizedPermissions;
  req?: PayloadRequest;
  user?: TypedUser | null;
};

const resolveSiteURL = async (
  option: AdminBarPluginOptions['siteURL'],
  payload: Payload,
  req: PayloadRequest | undefined,
) => {
  if (typeof option === 'function' && req) return option({ payload, req });
  if (typeof option === 'string') return option;
  return payload.config.serverURL || '/';
};

const hostName = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return 'Website';
  }
};

/** A relationship value as an id: `3`, `'abc'`, `{ id: 3 }`, or the first of a hasMany list. */
const relationID = (value: unknown): number | string | null => {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first === 'number' || typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'id' in first) {
    const { id } = first as { id: unknown };
    if (typeof id === 'number' || typeof id === 'string') return id;
  }
  return null;
};

/** A tenant read as the logged-in user, so one they may not see stays hidden. */
const findTenant = async (
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
const selectedTenantID = (
  tenants: AdminBarTenantsOptions,
  payload: Payload,
  req: PayloadRequest,
) => {
  const value = parseCookies(req.headers).get(tenants.cookie ?? DEFAULT_TENANT_COOKIE);
  if (!value) return null;
  // The cookie is text; a numeric id must be a number to match
  return payload.db.defaultIDType === 'number' && /^\d+$/.test(value) ? Number(value) : value;
};

/** The tenant item: its name, linking to its home page when `tenants.path` gives one. */
const tenantLink = async (
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

/** The document on screen, read once for both its tenant and its View link. */
const readDocument = async (
  slug: CollectionSlug,
  docID: number | string,
  payload: Payload,
  req: PayloadRequest,
) => {
  try {
    return (await payload.findByID({
      collection: slug,
      depth: 0,
      draft: false,
      id: docID,
      overrideAccess: false,
      req,
    })) as Record<string, unknown> | null;
  } catch {
    return null;
  }
};

/** The document's page on the website, when it has a published one. */
const viewLink = async ({
  doc,
  i18n,
  options,
  payload,
  req,
  siteURL,
  slug,
  tenant,
}: {
  doc: Record<string, unknown>;
  i18n?: Props['i18n'];
  options: NonNullable<Props['adminBar']>;
  payload: Payload;
  req: PayloadRequest;
  siteURL: string;
  slug: CollectionSlug;
  tenant: AdminBarTenant | null;
}): Promise<BarLink | null> => {
  const path = options.collections?.[slug]?.path;
  // Never published: the page doesn't exist yet (the Preview button shows the draft)
  if (!path || doc._status === 'draft') return null;

  try {
    // `path` is typed per collection; the slug only narrows to the union here
    const docPath = await path({ doc: doc as never, req, tenant });
    const href = docPath ? siteHref(siteURL, docPath) : null;
    if (!href) return null;

    const singular = labelText(
      payload.collections[slug]?.config.labels?.singular as PayloadLabel,
      'document',
      i18n,
    ).toLowerCase();

    return { label: `View ${singular}`, href };
  } catch {
    return null;
  }
};

/**
 * The admin bar in the admin, above Payload's own header (`admin.components.header`). Added by
 * `adminBarPlugin`; a server component, so the site URL can come from the request.
 */
export const AdminHeaderBar = async ({
  adminBar: options = {},
  collectionSlug,
  docID,
  i18n,
  payload,
  permissions,
  req,
  user,
}: Props): Promise<React.ReactElement | null> => {
  if (!user) return null;

  const { config } = payload;
  const links = adminLinks({
    admin: config.routes.admin,
    api: config.routes.api,
    account: config.admin.routes.account,
    logout: config.admin.routes.logout,
  });

  const siteURL = await resolveSiteURL(options.siteURL, payload, req);
  const { tenants } = options;

  const slug = collectionSlug as CollectionSlug | undefined;
  const known = slug ? options.collections?.[slug] : undefined;
  // Read the document only when the bar needs it: for its View link or its tenant
  const doc =
    slug && docID !== undefined && req && (known?.path || tenants)
      ? await readDocument(slug, docID, payload, req)
      : null;

  // The document's own tenant, so an editor sees where it lives; else the one selected
  const docTenantID = tenants && doc ? relationID(doc[tenants.field ?? 'tenant']) : null;
  const tenant =
    tenants && req
      ? await findTenant(
          tenants,
          docTenantID ?? selectedTenantID(tenants, payload, req),
          payload,
          req,
        )
      : null;
  // The View link gets the document's tenant only, never the selected one
  const docTenant = docTenantID !== null ? tenant : null;

  const create = Object.entries(options.collections ?? {})
    .filter(
      ([slug, collection]) =>
        collection?.create !== false &&
        payload.collections[slug as CollectionSlug] &&
        permissions?.collections?.[slug]?.create,
    )
    .map(([slug]) => ({
      label: labelText(
        payload.collections[slug as CollectionSlug]?.config.labels?.singular as PayloadLabel,
        slug,
        i18n,
      ),
      href: links.create(slug),
    }));

  return (
    <Bar
      create={create}
      current={
        doc && slug && req
          ? await viewLink({
              doc,
              i18n,
              options,
              payload,
              req,
              siteURL,
              slug,
              tenant: docTenant,
            })
          : null
      }
      site={{ label: options.siteName || hostName(siteURL), href: siteHref(siteURL, '/') ?? '/' }}
      siteInNewTab
      tenant={
        tenants && tenant && req ? await tenantLink(tenants, tenant, payload, req, siteURL) : null
      }
      user={{
        label: String((user as { email?: unknown }).email ?? 'Account'),
        account: links.account,
        logout: links.logout,
      }}
    />
  );
};
