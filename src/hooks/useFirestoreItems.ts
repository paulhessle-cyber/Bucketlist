import { useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { BucketItem } from '../types';

export function useFirestoreItems(uid: string | null) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [ready, setReady] = useState(false);
  const readySentinel = useRef<string | null>(null);

  useEffect(() => {
    if (!db || !uid) {
      setItems([]);
      setReady(false);
      return;
    }
    if (readySentinel.current !== uid) {
      setReady(false);
      readySentinel.current = uid;
    }
    const unsub = onSnapshot(
      collection(db, 'users', uid, 'items'),
      (snap) => {
        setItems(snap.docs.map((d) => d.data() as BucketItem));
        setReady(true);
      },
      () => setReady(true)
    );
    return unsub;
  }, [uid]);

  async function saveItem(item: BucketItem) {
    if (!db || !uid) return;
    await setDoc(doc(db, 'users', uid, 'items', item.id), item);
  }

  async function removeItem(id: string) {
    if (!db || !uid) return;
    await deleteDoc(doc(db, 'users', uid, 'items', id));
  }

  // Server-side atomic append — safe even if multiple photo uploads (or devices)
  // race each other, unlike a client-computed read-then-write merge.
  async function addPhotosToItem(id: string, photos: string[]) {
    if (!db || !uid) return;
    await updateDoc(doc(db, 'users', uid, 'items', id), { photos: arrayUnion(...photos) });
  }

  async function importItems(localItems: BucketItem[]) {
    if (!db || !uid || localItems.length === 0) return;
    const batch = writeBatch(db);
    for (const item of localItems) {
      batch.set(doc(db, 'users', uid, 'items', item.id), item);
    }
    await batch.commit();
  }

  async function hasAnyRemoteItems() {
    if (!db || !uid) return false;
    const snap = await getDocs(collection(db, 'users', uid, 'items'));
    return !snap.empty;
  }

  return { items, ready, saveItem, removeItem, addPhotosToItem, importItems, hasAnyRemoteItems };
}
