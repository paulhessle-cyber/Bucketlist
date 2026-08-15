import { useState } from 'react';
import type { BucketItem, VisitedCountry } from './types';
import { useIndexedStorage } from './hooks/useIndexedStorage';
import { BottomNav, type TabKey } from './components/BottomNav';
import { MyListPage } from './components/MyListPage';
import { TravelListPage } from './components/TravelListPage';
import { AchievedPage } from './components/AchievedPage';
import { AchievedDetail } from './components/AchievedDetail';
import './App.css';

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('my-list');
  const [items, setItems] = useIndexedStorage<BucketItem[]>('bucketlist.items', []);
  const [visited, setVisited] = useIndexedStorage<VisitedCountry[]>('bucketlist.visitedCountries', []);
  const [detailItem, setDetailItem] = useState<BucketItem | null>(null);

  function addItem(kind: BucketItem['kind'], data: Pick<BucketItem, 'title' | 'emoji' | 'location' | 'targetDate'>) {
    const item: BucketItem = {
      id: makeId(),
      kind,
      status: 'active',
      photos: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    setItems((prev) => [...prev, item]);
  }

  function updateItem(id: string, data: Partial<BucketItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
    setDetailItem((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev));
  }

  // Merges against the latest state rather than a snapshot passed as a prop, so photos
  // added in quick succession (each starting from its own stale `item.photos`) can't clobber
  // one another the way a plain updateItem(id, { photos: [...item.photos, ...new] }) would.
  function addPhotos(id: string, newPhotos: string[]) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, photos: [...i.photos, ...newPhotos] } : i)));
    setDetailItem((prev) => (prev && prev.id === id ? { ...prev, photos: [...prev.photos, ...newPhotos] } : prev));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleAchieved(id: string) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (i.status === 'active') {
          return { ...i, status: 'achieved', achievedDate: todayIso() };
        }
        return { ...i, status: 'active', achievedDate: undefined };
      })
    );
  }

  function unachieve(id: string) {
    toggleAchieved(id);
    setDetailItem(null);
  }

  function toggleCountry(id: string, name: string) {
    setVisited((prev) => {
      const exists = prev.some((v) => v.id === id);
      if (exists) return prev.filter((v) => v.id !== id);
      return [...prev, { id, name, visitedAt: todayIso() }];
    });
  }

  const personalItems = items.filter((i) => i.kind === 'personal');
  const travelItems = items.filter((i) => i.kind === 'travel');

  return (
    <div className="app-shell">
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
        {tab === 'achieved' && <AchievedPage items={items} onOpen={setDetailItem} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />

      {detailItem && (
        <AchievedDetail
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onUpdate={updateItem}
          onAddPhotos={addPhotos}
          onUnachieve={unachieve}
        />
      )}
    </div>
  );
}
