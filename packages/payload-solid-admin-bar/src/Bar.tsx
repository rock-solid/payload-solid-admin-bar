import type React from 'react';

import { NewMenu } from './NewMenu.js';
import { TenantMenu, type BarTenant } from './TenantMenu.js';

import './styles.css';

export type BarLink = { label: string; href: string };

export type BarProps = {
  /** The site's name; links to the website in the admin and to the dashboard on the website. */
  site: BarLink;
  /** The tenant on screen in a multi-tenant site, e.g. a location; links to its home page. */
  tenant?: { id?: number | string; label: string; href?: string | null } | null;
  /**
   * Every tenant the user may work on. With more than one, the tenant item becomes "My sites": a
   * menu with each one's home page (Visit) and, given `tenantMenu`, Manage.
   */
  tenants?: BarTenant[];
  /** For Manage: the admin dashboard and the multi-tenant plugin's cookie (null: no Manage). */
  tenantMenu?: { dashboard: string; cookie: string | null };
  /** Edit (on the website) or View (in the admin) for the document on screen. */
  current?: BarLink | null;
  /** The collections the user may create, for the "+ New" menu. */
  create?: BarLink[];
  /** Runs when one of the "+ New" links is followed, before the browser leaves the page. */
  onCreate?: () => void;
  /** Shown while the website is in draft (preview) mode. */
  onPreviewExit?: () => void;
  user: { label: string; account: string; logout: string };
  /** Opens website links in a new tab, as the admin does. */
  siteInNewTab?: boolean;
  className?: string;
};

const newTab = { rel: 'noopener noreferrer', target: '_blank' } as const;

/**
 * The bar itself, with no state, so the admin can render it on the server and the website in the
 * browser, and both look the same.
 */
export const Bar: React.FC<BarProps> = ({
  className,
  create = [],
  current,
  onCreate,
  onPreviewExit,
  site,
  siteInNewTab,
  tenant,
  tenantMenu,
  tenants = [],
  user,
}) => (
  <nav
    aria-label="Admin bar"
    className={className ? `solid-admin-bar ${className}` : 'solid-admin-bar'}
  >
    <ul className="solid-admin-bar__group">
      <li>
        <a
          className="solid-admin-bar__item solid-admin-bar__site"
          href={site.href}
          {...(siteInNewTab && newTab)}
        >
          {site.label}
        </a>
      </li>
      {tenants.length > 1 ? (
        <li>
          <TenantMenu
            cookie={tenantMenu?.cookie ?? null}
            current={tenant}
            dashboard={tenantMenu?.dashboard ?? '/admin'}
            siteInNewTab={siteInNewTab}
            tenants={tenants}
          />
        </li>
      ) : (
        tenant && (
          <li>
            {tenant.href ? (
              <a
                className="solid-admin-bar__item solid-admin-bar__tenant"
                href={tenant.href}
                {...(siteInNewTab && newTab)}
              >
                {tenant.label}
              </a>
            ) : (
              <span className="solid-admin-bar__item solid-admin-bar__tenant">{tenant.label}</span>
            )}
          </li>
        )
      )}
      {current && (
        <li>
          <a className="solid-admin-bar__item" href={current.href} {...(siteInNewTab && newTab)}>
            {current.label}
          </a>
        </li>
      )}
      {create.length > 0 && (
        <li>
          <NewMenu items={create} onSelect={onCreate} />
        </li>
      )}
      {onPreviewExit && (
        <li>
          <button
            className="solid-admin-bar__item solid-admin-bar__preview"
            onClick={onPreviewExit}
            type="button"
          >
            Exit preview
          </button>
        </li>
      )}
    </ul>
    <ul className="solid-admin-bar__group">
      <li>
        <a className="solid-admin-bar__item solid-admin-bar__user" href={user.account}>
          {user.label}
        </a>
      </li>
      <li>
        <a className="solid-admin-bar__item" href={user.logout}>
          Log out
        </a>
      </li>
    </ul>
  </nav>
);
