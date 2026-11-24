'use client';

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react';
import { useRouter } from 'next/navigation';

/** Refreshes the page in Live Preview as the editor types. */
export const LivePreviewListener = () => {
  const router = useRouter();
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={typeof window === 'undefined' ? '' : window.location.origin}
    />
  );
};
