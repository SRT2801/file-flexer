import { createRequestHandler } from '@netlify/angular-runtime/server';

export default createRequestHandler();

export const config = {
  path: '/*',
};
