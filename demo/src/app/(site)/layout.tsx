import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import type React from 'react';

import { SiteAdminBar } from '@/components/SiteAdminBar';
import { listPublished, listSites, mainSite } from '@/data';
import { MAIN_SITE, siteHome } from '@/paths';
import { SITE_NAME } from '@/site';

import '@rocksoliddigital/payload-solid-admin-bar/styles.css';

import './site.css';

export const metadata: Metadata = { title: SITE_NAME };

// Rendered per request, so `next build` needs no database (the demo's schema is pushed by `next dev`)
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode();
  const main = await mainSite();
  const pages = main ? await listPublished('pages', main) : [];
  const sites = (await listSites()).filter((site) => site.slug !== MAIN_SITE);

  return (
    <html lang="en">
      <body>
        <SiteAdminBar preview={isEnabled} siteName={SITE_NAME} />
        <header className="site-header">
          <Link className="site-name" href="/">
            {SITE_NAME}
          </Link>
          <nav aria-label="Main">
            {pages
              .filter((page) => page.slug !== 'home')
              .map((page) => (
                <Link href={`/${page.slug}`} key={page.id}>
                  {page.title}
                </Link>
              ))}
            {sites.map((site) => (
              <Link href={siteHome(site.slug)} key={site.id}>
                {site.name}
              </Link>
            ))}
            <Link href="/posts">Posts</Link>
            <a href="/admin">Admin</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
