import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  function signIn() {
    if (!auth) return;
    signInWithPopup(auth, googleProvider).catch((err) => {
      window.alert("Couldn't sign in: " + (err instanceof Error ? err.message : String(err)));
    });
  }

  function signOut() {
    if (!auth) return;
    firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut };
}
