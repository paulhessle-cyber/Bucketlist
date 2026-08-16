import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

export { isFirebaseConfigured };

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();

// Firestore's own offline cache (backed by IndexedDB) means data loads instantly from
// the last sync on open and mutations queue automatically while offline, without needing
// a separate local storage layer once signed in.
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
      // BucketItem's optional fields (location, targetDate, achievedDate, description) are
      // set to `undefined` rather than omitted when empty; Firestore rejects `undefined` by
      // default, so drop those fields instead of failing the whole write.
      ignoreUndefinedProperties: true,
    })
  : null;
