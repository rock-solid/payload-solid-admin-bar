'use client';

import type React from 'react';

import { Menu } from './Menu.js';

/** A tenant the user may work on: its name, its id and its home page. */
export type BarTenant = { id: number | string; label: string; href?: string | null };

/** Sets the multi-tenant plugin's cookie as the plugin does: a year, the whole site. */
export const setTenantCookie = (name: string, id: number | string) => {
  document.cookie = `${name}=${encodeURIComponent(String(id))}; Max-Age=31536000; Path=/; SameSite=Lax`;
};

/**
 * "My sites", as in WordPress: every tenant the user may work on, each with its home page (Visit)
 * and, where the bar can set the multi-tenant plugin's cookie, Manage: the admin, switched to it.
 */
export const TenantMenu: React.FC<{
  tenants: BarTenant[];
  /** The tenant on screen, if any. */
  current?: { id?: number | string; label: string } | null;
  /** The admin dashboard, for Manage. */
  dashboard: string;
  /** The cookie Manage sets; null when the bar can't set it (the CMS is on another origin). */
  cookie: string | null;
  siteInNewTab?: boolean;
}> = ({ cookie, current, dashboard, siteInNewTab, tenants }) => (
  <Menu className="solid-admin-bar__tenant" label={current?.label ?? 'My sites'}>
    {tenants.map((tenant) => (
      <li
        aria-current={current?.id === tenant.id ? 'true' : undefined}
        className="solid-admin-bar__tenant-row"
        key={tenant.id}
      >
        <span className="solid-admin-bar__tenant-name">{tenant.label}</span>
        {tenant.href && (
          <a
            aria-label={`Visit ${tenant.label}`}
            className="solid-admin-bar__item"
            href={tenant.href}
            {...(siteInNewTab && { rel: 'noopener noreferrer', target: '_blank' })}
          >
            Visit
          </a>
        )}
        {cookie && (
          <a
            aria-label={`Manage ${tenant.label}`}
            className="solid-admin-bar__item"
            href={dashboard}
            onClick={() => setTenantCookie(cookie, tenant.id)}
          >
            Manage
          </a>
        )}
      </li>
    ))}
  </Menu>
);
