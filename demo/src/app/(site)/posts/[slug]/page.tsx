import { Document } from '@/components/Document';

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Document collection="posts" slug={slug} />;
}
