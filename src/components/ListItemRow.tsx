import type { BucketItem } from '../types';
import './ListItemRow.css';

interface ListItemRowProps {
  item: BucketItem;
  onToggle: (id: string) => void;
  onOpen: (item: BucketItem) => void;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function ListItemRow({ item, onToggle, onOpen }: ListItemRowProps) {
  const isDone = item.status === 'achieved';
  return (
    <div className="list-row">
      <button
        className={`check-box ${isDone ? 'checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(item.id);
        }}
        aria-label={isDone ? 'Mark as not achieved' : 'Mark as achieved'}
      >
        {isDone && <span className="check-icon">✌🏻</span>}
      </button>
      <div className="list-row-text" onClick={() => onOpen(item)}>
        <span className={`list-row-title ${isDone ? 'done' : ''}`}>{item.title}</span>
        {item.location && <span className="list-row-sub">{item.location}</span>}
        {item.targetDate && !isDone && (
          <span className="list-row-date">📅 {formatDate(item.targetDate)}</span>
        )}
      </div>
      <div className="list-row-icon" onClick={() => onOpen(item)}>
        <span>{item.emoji}</span>
        <span className="chevron">›</span>
      </div>
    </div>
  );
}
