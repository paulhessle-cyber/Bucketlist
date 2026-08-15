// Paste the config object from Firebase Console > Project settings > Your apps > Web app.
// These values are meant to be public/embedded in client apps (protected by Firestore
// security rules, not secrecy) — safe to commit.
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';
