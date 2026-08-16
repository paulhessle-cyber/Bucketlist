// Paste the config object from Firebase Console > Project settings > Your apps > Web app.
// These values are meant to be public/embedded in client apps (protected by Firestore
// security rules, not secrecy) — safe to commit.
export const firebaseConfig = {
  apiKey: 'AIzaSyCKNXT7XIw-DCxqjX0wX9PB8pKJ-pmvWr4',
  authDomain: 'bucketlist-9c7e3.firebaseapp.com',
  projectId: 'bucketlist-9c7e3',
  storageBucket: 'bucketlist-9c7e3.firebasestorage.app',
  messagingSenderId: '1060571314162',
  appId: '1:1060571314162:web:527e76cde51079db375d6b',
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';
