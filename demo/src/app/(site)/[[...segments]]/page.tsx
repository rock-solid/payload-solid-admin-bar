import { notFound } from 'next/navigation';

import { Document } from '@/components/Document';
import { findSite, mainSite } from '@/data';
import { MAIN_SITE } from '@/paths';

/**
 * Every page of every site: `/` and `/about` on the main site, `/harbour` and `/harbour/menu` on
 * another. The first segment is a site when one has that slug.
 */
export default async function Page({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments = [] } = await params;
  const [first, second, ...rest] = segments;
  if (rest.length) notFound();

  const prefixed = first && first !== MAIN_SITE ? await findSite(first) : null;
  const site = prefixed ?? (await mainSite());
  const slug = (prefixed ? second : first) ?? 'home';
  // The main site has no second level
  if (!prefixed && second) notFound();

  return <Document collection="pages" site={site} slug={slug} />;
}
