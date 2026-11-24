import type { Config } from 'payload';
import { describe, expect, it } from 'vitest';

import { ADMIN_BAR_COMPONENT, adminBarPlugin } from './plugin';

const config = {
  admin: { components: { header: ['/existing#Header'], actions: ['/x#Action'] } },
} as Config;

describe('adminBarPlugin', () => {
  it('puts the bar first in the admin header, keeping the config’s components', () => {
    const siteURL = () => 'https://tenant.example.com';
    const result = adminBarPlugin({ siteName: 'Site', siteURL })(config) as Config;

    expect(result.admin?.components?.header).toEqual([
      { path: ADMIN_BAR_COMPONENT, serverProps: { adminBar: { siteName: 'Site', siteURL } } },
      '/existing#Header',
    ]);
    expect(result.admin?.components?.actions).toEqual(['/x#Action']);
  });

  it('works on a config with no admin components', () => {
    const result = adminBarPlugin()({} as Config) as Config;

    expect(result.admin?.components?.header).toHaveLength(1);
  });

  it('leaves the config alone when disabled', () => {
    expect(adminBarPlugin({ enabled: false })(config)).toBe(config);
  });
});
