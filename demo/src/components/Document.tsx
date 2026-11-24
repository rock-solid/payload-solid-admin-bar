import { notFound } from 'next/navigation';
import { AdminBarDocument } from '@rocksoliddigital/payload-solid-admin-bar/site';

import { findBySlug } from '@/data';

import { LivePreviewListener } from './LivePreviewListener';

/** A page or post: its title and body, and which document it is for the bar's Edit link. */
export const Document = async ({
  collection,
  slug,
}: {
  collection: 'pages' | 'posts';
  slug: string;
}) => {
  const { doc, draft } = await findBySlug(collection, slug);
  if (!doc) notFound();

  return (
    <article>
      {draft && <LivePreviewListener />}
      <AdminBarDocument collection={collection} id={doc.id} />
      <h1>{doc.title}</h1>
      {draft && doc._status === 'draft' && <p className="badge">Draft</p>}
      {doc.body?.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </article>
  );
};
