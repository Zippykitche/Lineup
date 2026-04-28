import { ApiMode } from './types';
import { IApiAdapter } from './adapters/apiAdapter';
import { MockAdapter } from './adapters/mockAdapter';
import { RestAdapter } from './adapters/restAdapter';
import { FirebaseAdapter } from './adapters/firebaseAdapter';

const API_MODE = (import.meta.env.NEXT_PUBLIC_API_MODE || 'rest') as ApiMode;
const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
const FIREBASE_CONFIG = {
  apiKey: import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

function createAdapter(mode: ApiMode): IApiAdapter {
  switch (mode) {
    case 'rest':
      return new RestAdapter(API_BASE_URL);
    case 'firebase':
      return new FirebaseAdapter(FIREBASE_CONFIG);
    case 'mock':
    default:
      return new MockAdapter();
  }
}

/**
 * The API service instance used by the application.
 * All components should import from here.
 */
export const api = createAdapter(API_MODE);

// Re-export types for convenience
export * from './types';
