'use client';

import { useRouter } from 'next/navigation';
import { AdminBar } from '@rocksoliddigital/payload-solid-admin-bar/site';

/** The website's bar: a client wrapper, so it can refresh the page after Exit preview. */
export const SiteAdminBar = ({ preview, siteName }: { preview: boolean; siteName: string }) => {
  const router = useRouter();

  return (
    <AdminBar
      collections={{ pages: { label: 'Page' }, posts: { label: 'Post' } }}
      // "My sites": every site the user works on
      listTenants
      onPreviewExit={() => {
        void fetch('/next/exit-preview').then(() => router.refresh());
      }}
      preview={preview}
      siteName={siteName}
    />
  );
};
