import type React from 'react';

import { NewMenu } from './NewMenu.js';

export type BarLink = { label: string; href: string };

export type BarProps = {
  /** The site's name; links to the website in the admin and to the dashboard on the website. */
  site: BarLink;
  /** Edit (on the website) or View (in the admin) for the document on screen. */
  current?: BarLink | null;
  /** The collections the user may create, for the "+ New" menu. */
  create?: BarLink[];
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
  onPreviewExit,
  site,
  siteInNewTab,
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
      {current && (
        <li>
          <a className="solid-admin-bar__item" href={current.href} {...(siteInNewTab && newTab)}>
            {current.label}
          </a>
        </li>
      )}
      {create.length > 0 && (
        <li>
          <NewMenu items={create} />
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
