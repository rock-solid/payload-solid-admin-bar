import type {
  CollectionSlug,
  Payload,
  PayloadRequest,
  SanitizedPermissions,
  TypedUser,
} from 'payload';
import type React from 'react';

import { Bar, type BarLink } from '../Bar.js';
import { adminLinks, labelText, siteHref, type PayloadLabel } from '../links.js';
import { DEFAULT_TENANT_COOKIE } from '../constants.js';
import type { AdminBarPluginOptions, AdminBarTenant } from '../plugin.js';
import { hostName, resolveSiteURL } from './site.js';
import {
  findTenant,
  hasTenantField,
  listUserTenants,
  relationID,
  selectedTenantID,
  tenantField,
  tenantLink,
} from './tenants.js';

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
  const docHasTenant = Boolean(slug && tenants && hasTenantField(tenants, payload, slug));
  const doc =
    slug && docID !== undefined && req && (known?.path || docHasTenant)
      ? await readDocument(slug, docID, payload, req)
      : null;

  // The document's own tenant, so an editor sees where it lives; else the one selected
  const docTenantID = tenants && doc && docHasTenant ? relationID(doc[tenantField(tenants)]) : null;
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
        tenants && tenant && req
          ? { id: tenant.id, ...(await tenantLink(tenants, tenant, payload, req, siteURL)) }
          : null
      }
      tenantMenu={
        tenants
          ? { dashboard: links.dashboard, cookie: tenants.cookie ?? DEFAULT_TENANT_COOKIE }
          : undefined
      }
      tenants={tenants && req ? await listUserTenants(tenants, payload, req, siteURL) : []}
      user={{
        label: String((user as { email?: unknown }).email ?? 'Account'),
        account: links.account,
        logout: links.logout,
      }}
    />
  );
};
