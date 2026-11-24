import Link from 'next/link';

import { listPublished } from '@/data';

export default async function Posts() {
  const posts = await listPublished('posts');

  return (
    <>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            {post.excerpt && <> — {post.excerpt}</>}
          </li>
        ))}
      </ul>
    </>
  );
}
