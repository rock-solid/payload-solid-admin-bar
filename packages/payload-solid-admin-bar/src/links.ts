/** Where the admin lives, as the bar builds its links: the CMS origin and Payload's routes. */
export type AdminRoutes = {
  /** The CMS origin, e.g. `https://cms.example.com`; '' for links on the same origin. */
  cmsURL?: string;
  /** Payload's `routes.admin`. */
  admin?: string;
  /** Payload's `routes.api`. */
  api?: string;
  /** Payload's `admin.routes.account`. */
  account?: string;
  /** Payload's `admin.routes.logout`. */
  logout?: string;
};

// Index loops rather than /\/+$/: a regex anchored after `+` backtracks on long runs of '/'
const trimEndSlashes = (value: string) => {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end--;
  return value.slice(0, end);
};

const trimStartSlashes = (value: string) => {
  let start = 0;
  while (start < value.length && value[start] === '/') start++;
  return value.slice(start);
};

const join = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? trimEndSlashes(part) : trimStartSlashes(trimEndSlashes(part)),
    )
    .join('/');

/** The links into the admin that both bars share. */
export const adminLinks = ({
  cmsURL = '',
  admin = '/admin',
  api = '/api',
  account = '/account',
  logout = '/logout',
}: AdminRoutes = {}) => {
  const adminRoot = join(cmsURL, admin) || '/';

  return {
    dashboard: adminRoot,
    account: join(adminRoot, account),
    logout: join(adminRoot, logout),
    create: (collection: string) =>
      join(adminRoot, 'collections', encodeURIComponent(collection), 'create'),
    edit: (collection: string, id: number | string) =>
      join(
        adminRoot,
        'collections',
        encodeURIComponent(collection),
        encodeURIComponent(String(id)),
      ),
    me: (userCollection: string) => join(cmsURL, api, encodeURIComponent(userCollection), 'me'),
    access: join(cmsURL, api, 'access'),
  };
};

const scheme = /^([a-z][a-z\d+.-]*):/i;

/**
 * A path on the website, resolved against the site URL; an absolute URL is kept as it is. Only
 * http(s) links come out: anything else (`javascript:`, `data:`…) gives null.
 */
export const siteHref = (siteURL: string, path: string): string | null => {
  const href = scheme.test(path) ? path : `${trimEndSlashes(siteURL)}/${trimStartSlashes(path)}`;
  const protocol = scheme.exec(href)?.[1]?.toLowerCase();

  return protocol === undefined || protocol === 'http' || protocol === 'https' ? href : null;
};

/** A label Payload allows as a string, a per-language record or a function of i18n. */
export type PayloadLabel =
  | string
  | Record<string, string>
  | ((args: { i18n: unknown; t: unknown }) => string)
  | undefined
  | null
  | false;

/** The label as text, in the given language when it has one, else its first. */
export const labelText = (
  label: PayloadLabel,
  fallback: string,
  i18n?: { language?: string; t?: unknown },
): string => {
  if (!label) return fallback;
  if (typeof label === 'string') return label;
  if (typeof label === 'function') {
    try {
      return label({ i18n, t: i18n?.t }) || fallback;
    } catch {
      return fallback;
    }
  }

  const language = i18n?.language;
  return (language && label[language]) || Object.values(label)[0] || fallback;
};
