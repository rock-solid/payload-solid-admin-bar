import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getPayload, type PayloadRequest } from 'payload';
import { getSafeRedirect } from 'payload/shared';

import configPromise from '@payload-config';

import { PREVIEW_SECRET } from '@/site';

export type PreviewSearchParams = {
  path: string;
  previewSecret: string;
};

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise });

  const { searchParams } = new URL(req.url);

  const path = searchParams.get('path');
  const previewSecret = searchParams.get('previewSecret');

  if (previewSecret !== PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 });
  }

  if (!path) {
    return new Response('Insufficient search params', { status: 404 });
  }

  const safePath = getSafeRedirect({ fallbackTo: '', redirectTo: path });

  if (!safePath) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 });
  }

  let user;

  try {
    const authResult = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });
    user = authResult.user;
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview');
    return new Response('You are not allowed to preview this page', { status: 403 });
  }

  const draft = await draftMode();

  if (!user) {
    draft.disable();
    return new Response('You are not allowed to preview this page', { status: 403 });
  }

  draft.enable();

  redirect(safePath);
}
