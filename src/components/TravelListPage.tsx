import { useState } from 'react';
import type { BucketItem, VisitedCountry } from '../types';
import { PageHeader } from './PageHeader';
import { ListItemRow } from './ListItemRow';
import { ItemFormModal } from './ItemFormModal';
import { WorldMap } from './WorldMap';
import { CountryPickerModal } from './CountryPickerModal';
import './LinedPaper.css';
import './WorldMap.css';

interface TravelListPageProps {
  items: BucketItem[];
  visited: VisitedCountry[];
  onAdd: (data: Pick<BucketItem, 'title' | 'emoji' | 'location' | 'targetDate'>) => void;
  onUpdate: (id: string, data: Partial<BucketItem>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onToggleCountry: (id: string, name: string) => void;
}

export function TravelListPage({
  items,
  visited,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
  onToggleCountry,
}: TravelListPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BucketItem | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const visitedIds = new Set(visited.map((v) => v.id));
  const active = items.filter((i) => i.status === 'active');

  return (
    <div className="page">
      <PageHeader
        title="Travel List"
        subtitle={`${visited.length} ${visited.length === 1 ? 'country' : 'countries'} visited`}
        onAdd={() => setShowAdd(true)}
      />
      <div className="world-map-wrap">
        <WorldMap visitedIds={visitedIds} onToggleCountry={onToggleCountry} />
        <span className="map-stats">🌍 {visited.length} visited</span>
        <button className="map-add-btn" onClick={() => setShowCountryPicker(true)}>
          +
        </button>
      </div>
      <div className="lined-paper">
        {active.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">✈️</span>
            No travel plans yet.
            <br />
            Tap + to add a destination dream.
          </div>
        ) : (
          active.map((item) => (
            <ListItemRow key={item.id} item={item} onToggle={onToggle} onOpen={setEditing} />
          ))
        )}
      </div>

      {showAdd && (
        <ItemFormModal
          kind="travel"
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            onAdd(data);
            setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <ItemFormModal
          kind="travel"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            onUpdate(editing.id, data);
            setEditing(null);
          }}
          onDelete={() => {
            onDelete(editing.id);
            setEditing(null);
          }}
        />
      )}

      {showCountryPicker && (
        <CountryPickerModal
          visitedIds={visitedIds}
          onClose={() => setShowCountryPicker(false)}
          onToggleCountry={onToggleCountry}
        />
      )}
    </div>
  );
}
