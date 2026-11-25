'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';

import { Bar } from '../Bar.js';
import { adminLinks, siteHref, type AdminRoutes } from '../links.js';
import { DEFAULT_TENANT_COOKIE } from '../constants.js';
import { setTenantCookie, type BarTenant } from '../TenantMenu.js';

/** The bar's markup alone, for stories and custom wrappers. */
export { Bar, type BarProps } from '../Bar.js';

/** The document a page shows, for the bar's "Edit" link. */
export type AdminBarDocumentProps = {
  collection: string;
  id: number | string;
  /** "Edit <label>"; defaults to the collection's label from the bar's `collections`. */
  label?: string;
  /**
   * The document's tenant in a multi-tenant site, e.g. its location. The bar shows its name
   * (linking to `href`, its home page), and "+ New" creates documents in it.
   */
  tenant?: { id: number | string; label: string; href?: string | null } | null;
};

// One page shows one document; the page sets it, the bar (in the layout) reads it
let currentDocument: AdminBarDocumentProps | null = null;
const listeners = new Set<() => void>();
const setCurrentDocument = (doc: AdminBarDocumentProps | null) => {
  currentDocument = doc;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Render in a page to tell the admin bar which document the page shows. Renders nothing. */
export const AdminBarDocument: React.FC<AdminBarDocumentProps> = ({
  collection,
  id,
  label,
  tenant,
}) => {
  const tenantID = tenant?.id;
  const tenantLabel = tenant?.label;
  const tenantHref = tenant?.href;

  useEffect(() => {
    const doc: AdminBarDocumentProps = {
      collection,
      id,
      label,
      tenant:
        tenantID !== undefined && tenantLabel !== undefined
          ? { id: tenantID, label: tenantLabel, href: tenantHref }
          : null,
    };
    setCurrentDocument(doc);
    return () => {
      if (currentDocument === doc) setCurrentDocument(null);
    };
  }, [collection, id, label, tenantID, tenantLabel, tenantHref]);

  return null;
};

export type AdminBarProps = AdminRoutes & {
  /** The site's name; links to the admin dashboard. */
  siteName: string;
  /** The collections the bar knows, by slug, with their singular label. */
  collections?: Record<string, { label: string; create?: boolean }>;
  /** The auth collection editors log in with. Defaults to `users`. */
  userCollection?: string;
  /** Whether the page is in draft (preview) mode; shows "Exit preview". */
  preview?: boolean;
  onPreviewExit?: () => void;
  /**
   * Show the bar when the page is inside a frame. Defaults to false: in Payload's Live Preview the
   * site runs in an iframe in the admin, which has its own bar, so a second one would sit in the
   * preview and push the page down.
   */
  showInFrames?: boolean;
  /**
   * The cookie Payload's multi-tenant plugin keeps the selected tenant in. "+ New" sets it to the
   * page's tenant (`AdminBarDocument`'s `tenant`), so a new document starts in it. Only when the CMS
   * shares the site's origin. Defaults to `payload-tenant`; false leaves it alone.
   */
  tenantCookie?: string | false;
  /**
   * List every tenant the user may work on ("My sites"), from the plugin's
   * `/api/admin-bar/tenants`, which needs the plugin's `tenants` option. Defaults to false.
   */
  listTenants?: boolean;
};

/** Whether the CMS is on this page's origin, so its cookies are this page's cookies. */
const sameOrigin = (cmsURL: string | undefined) => {
  if (!cmsURL) return true;
  try {
    return new URL(cmsURL, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};

/** Whether the page runs inside a frame, such as Payload's Live Preview. */
export const isFramed = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    // A cross-origin parent can throw on access: the page is framed
    return true;
  }
};

type Me = { user: { email?: string } | null };
type Tenants = { tenants?: BarTenant[] };
type Access = { collections?: Record<string, { create?: boolean; update?: boolean }> };

/**
 * The admin bar on the website, for logged-in editors only. It asks the CMS who is logged in, so
 * visitors get nothing and the page itself can stay static.
 */
export const AdminBar: React.FC<AdminBarProps> = ({
  collections = {},
  listTenants = false,
  onPreviewExit,
  preview,
  showInFrames = false,
  siteName,
  tenantCookie = DEFAULT_TENANT_COOKIE,
  userCollection = 'users',
  ...routes
}) => {
  const links = adminLinks(routes);
  const doc = useSyncExternalStore(
    subscribe,
    () => currentDocument,
    () => null,
  );
  const [state, setState] = useState<{
    email: string;
    access: Access;
    tenants: BarTenant[];
  } | null>(null);

  useEffect(() => {
    // Framed (Live Preview): no bar, so no need to ask who is logged in
    if (!showInFrames && isFramed()) return;

    const controller = new AbortController();
    const get = <T,>(url: string) =>
      fetch(url, { credentials: 'include', signal: controller.signal }).then((res) =>
        res.ok ? (res.json() as Promise<T>) : null,
      );

    get<Me>(links.me(userCollection))
      .then(async (me) => {
        if (!me?.user) return;
        const [access, tenants] = await Promise.all([
          get<Access>(links.access),
          listTenants ? get<Tenants>(links.tenants) : null,
        ]);
        setState({
          email: me.user.email ?? 'Account',
          access: access ?? {},
          tenants: tenants?.tenants ?? [],
        });
      })
      .catch(() => {});

    return () => controller.abort();
    // The links only change with the routes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links.me(userCollection), links.access, links.tenants, listTenants, showInFrames]);

  if (!state) return null;

  const can = (slug: string, action: 'create' | 'update') =>
    Boolean(state.access.collections?.[slug]?.[action]);

  const current =
    doc && can(doc.collection, 'update')
      ? {
          label: `Edit ${(doc.label ?? collections[doc.collection]?.label ?? 'document').toLowerCase()}`,
          href: links.edit(doc.collection, doc.id),
        }
      : null;

  const create = Object.entries(collections)
    .filter(([slug, collection]) => collection.create !== false && can(slug, 'create'))
    .map(([slug, collection]) => ({ label: collection.label, href: links.create(slug) }));

  const tenant = doc?.tenant ?? null;
  // The bar can set the multi-tenant plugin's cookie only on the CMS's origin
  const cookie = tenantCookie && sameOrigin(routes.cmsURL) ? tenantCookie : null;
  const onCreate = tenant && cookie ? () => setTenantCookie(cookie, tenant.id) : undefined;
  // Only http(s) links, as in the admin's bar
  const safe = (href?: string | null) => (href ? siteHref('', href) : null);

  return (
    <Bar
      create={create}
      current={current}
      onCreate={onCreate}
      onPreviewExit={preview ? onPreviewExit : undefined}
      site={{ label: siteName, href: links.dashboard }}
      tenant={tenant && { id: tenant.id, label: tenant.label, href: safe(tenant.href) }}
      tenantMenu={{ dashboard: links.dashboard, cookie }}
      tenants={state.tenants.map((item) => ({ ...item, href: safe(item.href) }))}
      user={{ label: state.email, account: links.account, logout: links.logout }}
    />
  );
};
