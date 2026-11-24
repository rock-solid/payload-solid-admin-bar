import type {
  CollectionSlug,
  DataFromCollectionSlug,
  Payload,
  PayloadRequest,
  Plugin,
} from 'payload';

export type AdminBarCollection<TSlug extends CollectionSlug = CollectionSlug> = {
  /**
   * The document's path on the website, e.g. `/news/${doc.slug}`, for the bar's "View" link on
   * its edit screen. Return null when the document has no page. Leave out for no "View" link.
   */
  path?: (args: {
    doc: DataFromCollectionSlug<TSlug>;
    req: PayloadRequest;
  }) => string | null | undefined | Promise<string | null | undefined>;
  /** List it under "+ New" (when the user may create it). Defaults to true. */
  create?: boolean;
};

export type AdminBarPluginOptions = {
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
  collections?: { [TSlug in CollectionSlug]?: AdminBarCollection<TSlug> };
  /** Leave the bar out of the admin; set to false in a test, say. Defaults to true. */
  enabled?: boolean;
};

export const ADMIN_BAR_COMPONENT = 'payload-solid-admin-bar/admin#AdminHeaderBar';

/** Puts the admin bar across the top of every admin screen. */
export const adminBarPlugin =
  (options: AdminBarPluginOptions = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config;

    const { enabled: _enabled, ...serverProps } = options;

    return {
      ...config,
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
