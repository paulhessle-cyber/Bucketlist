import { useEffect, useRef, useState } from 'react';
import type { BucketItem, VisitedCountry } from './types';
import { useIndexedStorage } from './hooks/useIndexedStorage';
import { useAuth } from './hooks/useAuth';
import { useFirestoreItems } from './hooks/useFirestoreItems';
import { useFirestoreVisited } from './hooks/useFirestoreVisited';
import { isFirebaseConfigured } from './firebase';
import { BottomNav, type TabKey } from './components/BottomNav';
import { MyListPage } from './components/MyListPage';
import { TravelListPage } from './components/TravelListPage';
import { AchievedPage } from './components/AchievedPage';
import { AchievedDetail } from './components/AchievedDetail';
import { SyncBar } from './components/SyncBar';
import './App.css';

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Firestore documents cap out at 1MiB; stay well under that so a write fails loudly
// (with a clear message) instead of silently, before ever hitting the hard limit.
const MAX_ITEM_BYTES = 900_000;

export default function App() {
  const [tab, setTab] = useState<TabKey>('my-list');
  const [detailItemId, setDetailItemId] = useState<string | null>(null);

  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const uid = user?.uid ?? null;
  const useCloud = isFirebaseConfigured && !!uid;

  const [localItems, setLocalItems] = useIndexedStorage<BucketItem[]>('bucketlist.items', []);
  const [localVisited, setLocalVisited] = useIndexedStorage<VisitedCountry[]>('bucketlist.visitedCountries', []);

  const cloudItems = useFirestoreItems(uid);
  const cloudVisited = useFirestoreVisited(uid);

  // One-time: if this account has no cloud data yet but this browser has local data,
  // upload it so signing in for the first time doesn't look like data loss.
  const migrated = useRef<string | null>(null);
  useEffect(() => {
    if (!useCloud || !uid || migrated.current === uid) return;
    migrated.current = uid;
    (async () => {
      const [hasItems, hasVisited] = await Promise.all([
        cloudItems.hasAnyRemoteItems(),
        cloudVisited.hasAnyRemoteVisited(),
      ]);
      if (!hasItems && localItems.length > 0) await cloudItems.importItems(localItems);
      if (!hasVisited && localVisited.length > 0) await cloudVisited.saveVisited(localVisited);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCloud, uid]);

  const items = useCloud ? cloudItems.items : localItems;
  const visited = useCloud ? cloudVisited.visited : localVisited;
  const detailItem = detailItemId ? (items.find((i) => i.id === detailItemId) ?? null) : null;

  function addItem(kind: BucketItem['kind'], data: Pick<BucketItem, 'title' | 'emoji' | 'location' | 'targetDate'>) {
    const item: BucketItem = {
      id: makeId(),
      kind,
      status: 'active',
      photos: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    if (useCloud) cloudItems.saveItem(item);
    else setLocalItems((prev) => [...prev, item]);
  }

  function updateItem(id: string, data: Partial<BucketItem>) {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const next = { ...current, ...data };
    if (useCloud) cloudItems.saveItem(next);
    else setLocalItems((prev) => prev.map((i) => (i.id === id ? next : i)));
  }

  function deleteItem(id: string) {
    if (useCloud) cloudItems.removeItem(id);
    else setLocalItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleAchieved(id: string) {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const next: BucketItem =
      current.status === 'active'
        ? { ...current, status: 'achieved', achievedDate: todayIso() }
        : { ...current, status: 'active', achievedDate: undefined };
    if (useCloud) cloudItems.saveItem(next);
    else setLocalItems((prev) => prev.map((i) => (i.id === id ? next : i)));
  }

  function unachieve(id: string) {
    toggleAchieved(id);
    setDetailItemId(null);
  }

  async function addPhotos(id: string, newPhotos: string[]) {
    if (useCloud) {
      const current = items.find((i) => i.id === id);
      const projectedSize = current
        ? new Blob([JSON.stringify({ ...current, photos: [...current.photos, ...newPhotos] })]).size
        : 0;
      if (projectedSize > MAX_ITEM_BYTES) {
        window.alert("This achievement has too many or too-large photos to sync. Remove one first.");
        return;
      }
      try {
        // Atomic server-side append — safe even if uploads overlap or race across devices.
        await cloudItems.addPhotosToItem(id, newPhotos);
      } catch (err) {
        window.alert("Couldn't save those photos: " + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, photos: [...i.photos, ...newPhotos] } : i)));
    }
  }

  function toggleCountry(id: string, name: string) {
    const exists = visited.some((v) => v.id === id);
    const next = exists ? visited.filter((v) => v.id !== id) : [...visited, { id, name, visitedAt: todayIso() }];
    if (useCloud) cloudVisited.saveVisited(next);
    else setLocalVisited(next);
  }

  const personalItems = items.filter((i) => i.kind === 'personal');
  const travelItems = items.filter((i) => i.kind === 'travel');

  return (
    <div className="app-shell">
      {isFirebaseConfigured && (
        <SyncBar user={user} authLoading={authLoading} onSignIn={signIn} onSignOut={signOut} />
      )}
      <div className="app-content">
        {tab === 'my-list' && (
          <MyListPage
            items={personalItems}
            onAdd={(data) => addItem('personal', data)}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onToggle={toggleAchieved}
          />
        )}
        {tab === 'travel-list' && (
          <TravelListPage
            items={travelItems}
            visited={visited}
            onAdd={(data) => addItem('travel', data)}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onToggle={toggleAchieved}
            onToggleCountry={toggleCountry}
          />
        )}
        {tab === 'achieved' && <AchievedPage items={items} onOpen={(item) => setDetailItemId(item.id)} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />

      {detailItem && (
        <AchievedDetail
          item={detailItem}
          onClose={() => setDetailItemId(null)}
          onUpdate={updateItem}
          onAddPhotos={addPhotos}
          onUnachieve={unachieve}
        />
      )}
    </div>
  );
}
