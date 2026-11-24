import type { Access } from 'payload';

/** Editors see everything; visitors see published documents only. */
export const publishedOrLoggedIn: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } };

export const loggedIn: Access = ({ req }) => Boolean(req.user);
