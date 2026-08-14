import { useState } from 'react';
import type { BucketItem } from '../types';
import { PageHeader } from './PageHeader';
import { ListItemRow } from './ListItemRow';
import { ItemFormModal } from './ItemFormModal';
import './LinedPaper.css';

interface MyListPageProps {
  items: BucketItem[];
  onAdd: (data: Pick<BucketItem, 'title' | 'emoji' | 'location' | 'targetDate'>) => void;
  onUpdate: (id: string, data: Partial<BucketItem>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function MyListPage({ items, onAdd, onUpdate, onDelete, onToggle }: MyListPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BucketItem | null>(null);

  const active = items.filter((i) => i.status === 'active');

  return (
    <div className="page">
      <PageHeader title="My Bucket List" subtitle="Every dream, one tidy list" onAdd={() => setShowAdd(true)} />
      <div className="lined-paper">
        {active.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🪣</span>
            Nothing on the list yet.
            <br />
            Tap + to add your first dream.
          </div>
        ) : (
          active.map((item) => (
            <ListItemRow key={item.id} item={item} onToggle={onToggle} onOpen={setEditing} />
          ))
        )}
      </div>

      {showAdd && (
        <ItemFormModal
          kind="personal"
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            onAdd(data);
            setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <ItemFormModal
          kind="personal"
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
    </div>
  );
}
