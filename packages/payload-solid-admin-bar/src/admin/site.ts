import type { Payload, PayloadRequest } from 'payload';

import type { AdminBarPluginOptions } from '../plugin.js';

/** Where the website is: the `siteURL` option, else the config's `serverURL`, else '/'. */
export const resolveSiteURL = async (
  option: AdminBarPluginOptions['siteURL'],
  payload: Payload,
  req: PayloadRequest | undefined,
) => {
  if (typeof option === 'function' && req) return option({ payload, req });
  if (typeof option === 'string') return option;
  return payload.config.serverURL || '/';
};

export const hostName = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return 'Website';
  }
};
