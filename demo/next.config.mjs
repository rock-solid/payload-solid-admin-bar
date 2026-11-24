import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The default bottom-left indicator covers Payload's admin nav
  devIndicators: { position: 'bottom-right' },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
