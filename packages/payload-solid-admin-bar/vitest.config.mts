import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        // The plugin, the admin bar's server side and the link helpers, with a fake Payload
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        // Components in a real browser. Each file runs in an iframe, as Live Preview runs the site.
        plugins: [react()],
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            // On CI, the runner's Google Chrome; locally, `pnpm exec playwright install chromium`
            provider: playwright({
              launchOptions: { channel: process.env.CI ? 'chrome' : undefined },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
