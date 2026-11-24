import { Document } from '@/components/Document';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Document collection="pages" slug={slug} />;
}
