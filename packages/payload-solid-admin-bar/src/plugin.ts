import type {
  CollectionSlug,
  DataFromCollectionSlug,
  Payload,
  PayloadRequest,
  Plugin,
  TypedUser,
} from 'payload';

import { tenantsEndpoint } from './admin/endpoint.js';

/** A tenant document as the bar reads it (depth 0): its id and its fields. */
export type AdminBarTenant = { id: number | string; [field: string]: unknown };

export type AdminBarCollection<
  TSlug extends CollectionSlug = CollectionSlug,
  TTenant extends { id: number | string } = AdminBarTenant,
> = {
  /**
   * The document's path on the website, e.g. `/news/${doc.slug}`, for the bar's "View" link on
   * its edit screen. Return null when the document has no page. Leave out for no "View" link.
   * With `tenants`, `tenant` is the document's tenant (null when it has none), so the path can
   * carry its prefix (`/${tenant.slug}/news/…`) or be a full URL on its domain.
   */
  path?: (args: {
    doc: DataFromCollectionSlug<TSlug>;
    req: PayloadRequest;
    /** Always passed by the bar; optional so code can call `path` without it. */
    tenant?: TTenant | null;
  }) => string | null | undefined | Promise<string | null | undefined>;
  /** List it under "+ New" (when the user may create it). Defaults to true. */
  create?: boolean;
};

/**
 * Multi-tenancy, as Payload's multi-tenant plugin sets it up: a tenants collection, a tenant field
 * on each document and a cookie holding the tenant selected in the admin.
 */
export type AdminBarTenantsOptions<TTenant extends { id: number | string } = AdminBarTenant> = {
  /** The tenants collection, e.g. `tenants` or `locations`. */
  collection: CollectionSlug;
  /** The field on documents that holds their tenant. Defaults to `tenant`. */
  field?: string;
  /** The cookie holding the selected tenant's id. Defaults to `payload-tenant`. */
  cookie?: string;
  /**
   * The tenant's name in the bar. Defaults to its collection's `useAsTitle` field, then its id.
   */
  label?: (tenant: TTenant) => string;
  /**
   * The tenant's home page: a path on the website (`/${tenant.slug}`) or a full URL on its own
   * domain. Return null for no link. Leave out to show the tenant's name without a link.
   */
  path?: (args: {
    tenant: TTenant;
    req: PayloadRequest;
  }) => string | null | undefined | Promise<string | null | undefined>;
  /**
   * The same as the multi-tenant plugin's option: users it lets through may work on every tenant;
   * the others only on those in their tenants array. Decides what "My sites" lists. Defaults to
   * nobody.
   */
  userHasAccessToAllTenants?: (user: TypedUser) => boolean;
  /** The users' tenants array, as in the multi-tenant plugin. Defaults to `tenants`. */
  arrayField?: string;
  /** The tenant field in each row of that array. Defaults to `tenant`. */
  arrayTenantField?: string;
};

export type AdminBarPluginOptions<TTenant extends { id: number | string } = AdminBarTenant> = {
  /** The site's name in the bar. Defaults to the site URL's host name. */
  siteName?: string;
  /**
   * Where the website is. Leave it out when the site and the admin share an origin: the links
   * then stay relative and work on every domain the app answers on (previews included). A
   * function gets the request, so a multi-tenant site can return the selected tenant's domain.
   * Defaults to the config's `serverURL`, then '/'.
   */
  siteURL?:
    string | ((args: { payload: Payload; req: PayloadRequest }) => string | Promise<string>);
  /**
   * The collections the bar knows, by slug, in the order "+ New" lists them. Others get no "View"
   * link and aren't under "+ New". Each `path` gets its own collection's document type.
   */
  collections?: { [TSlug in CollectionSlug]?: AdminBarCollection<TSlug, TTenant> };
  /**
   * For a multi-tenant site: the bar names the tenant on screen (the document's, else the one
   * selected in the admin) and links to its home page, and each `path` gets the document's tenant.
   */
  tenants?: AdminBarTenantsOptions<TTenant>;
  /** Leave the bar out of the admin; set to false in a test, say. Defaults to true. */
  enabled?: boolean;
};

export const ADMIN_BAR_COMPONENT = '@rocksoliddigital/payload-solid-admin-bar/admin#AdminHeaderBar';

export { DEFAULT_TENANT_COOKIE, TENANTS_ENDPOINT } from './constants.js';

/** Puts the admin bar across the top of every admin screen. */
export const adminBarPlugin =
  <TTenant extends { id: number | string } = AdminBarTenant>(
    options: AdminBarPluginOptions<TTenant> = {},
  ): Plugin =>
  (config) => {
    if (options.enabled === false) return config;

    const { enabled: _enabled, ...serverProps } = options;

    return {
      ...config,
      // "My sites" on the website asks this which tenants the user may work on
      endpoints: options.tenants
        ? [...(config.endpoints ?? []), tenantsEndpoint(options as AdminBarPluginOptions)]
        : config.endpoints,
      admin: {
        ...config.admin,
        components: {
          ...config.admin?.components,
          header: [
            { path: ADMIN_BAR_COMPONENT, serverProps: { adminBar: serverProps } },
            ...(config.admin?.components?.header ?? []),
          ],
        },
      },
    };
  };
