import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { VisitedCountry } from '../types';

const DOC_PATH = ['visited', 'countries'] as const;

export function useFirestoreVisited(uid: string | null) {
  const [visited, setVisited] = useState<VisitedCountry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!db || !uid) {
      setVisited([]);
      setReady(false);
      return;
    }
    setReady(false);
    const ref = doc(db, 'users', uid, ...DOC_PATH);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setVisited((snap.data()?.list as VisitedCountry[] | undefined) ?? []);
        setReady(true);
      },
      () => setReady(true)
    );
    return unsub;
  }, [uid]);

  async function saveVisited(list: VisitedCountry[]) {
    if (!db || !uid) return;
    await setDoc(doc(db, 'users', uid, ...DOC_PATH), { list });
  }

  async function hasAnyRemoteVisited() {
    if (!db || !uid) return false;
    const snap = await getDoc(doc(db, 'users', uid, ...DOC_PATH));
    return snap.exists() && ((snap.data()?.list as VisitedCountry[] | undefined)?.length ?? 0) > 0;
  }

  return { visited, ready, saveVisited, hasAnyRemoteVisited };
}
