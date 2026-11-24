import type {
  CollectionSlug,
  Payload,
  PayloadRequest,
  SanitizedPermissions,
  TypedUser,
} from 'payload';
import type React from 'react';

import { Bar, type BarLink } from '../Bar';
import { adminLinks, labelText, siteHref, type PayloadLabel } from '../links';
import type { AdminBarPluginOptions } from '../plugin';

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

/** The document on screen's page on the website, when it has a published one. */
const viewLink = async ({
  collectionSlug,
  docID,
  i18n,
  options,
  payload,
  req,
  siteURL,
}: {
  collectionSlug?: string;
  docID?: number | string;
  i18n?: Props['i18n'];
  options: NonNullable<Props['adminBar']>;
  payload: Payload;
  req?: PayloadRequest;
  siteURL: string;
}): Promise<BarLink | null> => {
  const slug = collectionSlug as CollectionSlug | undefined;
  const path = slug ? options.collections?.[slug]?.path : undefined;
  if (!slug || !path || docID === undefined || !req) return null;

  try {
    const doc = await payload.findByID({
      collection: slug,
      depth: 0,
      draft: false,
      id: docID,
      overrideAccess: false,
      req,
    });
    // Never published: the page doesn't exist yet (the Preview button shows the draft)
    if (!doc || (doc as { _status?: string })._status === 'draft') return null;

    // `path` is typed per collection; the slug only narrows to the union here
    const docPath = await path({ doc: doc as never, req });
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
      current={await viewLink({ collectionSlug, docID, i18n, options, payload, req, siteURL })}
      site={{ label: options.siteName || hostName(siteURL), href: siteHref(siteURL, '/') ?? '/' }}
      siteInNewTab
      user={{
        label: String((user as { email?: unknown }).email ?? 'Account'),
        account: links.account,
        logout: links.logout,
      }}
    />
  );
};
