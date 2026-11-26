import { AdminBarDocument } from '@rocksoliddigital/payload-solid-admin-bar/site';
import { notFound } from 'next/navigation';

import { findBySlug } from '@/data';
import type { Site } from '@/payload-types';
import { siteHome } from '@/paths';

import { LivePreviewListener } from './LivePreviewListener';

/**
 * A page or post: its title and body, and which document it is for the bar's Edit link. A page
 * also tells the bar its site, which the bar names and creates new documents in.
 */
export const Document = async ({
  collection,
  site,
  slug,
}: {
  collection: 'pages' | 'posts';
  site?: Site | null;
  slug: string;
}) => {
  const { doc, draft } = await findBySlug(collection, slug, site);
  if (!doc) notFound();

  return (
    <article>
      {draft && <LivePreviewListener />}
      <AdminBarDocument
        collection={collection}
        id={doc.id}
        tenant={site ? { id: site.id, label: site.name, href: siteHome(site.slug) } : null}
      />
      <h1>{doc.title}</h1>
      {draft && doc._status === 'draft' && <p className="badge">Draft</p>}
      {doc.body?.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </article>
  );
};
