import type { BucketItem } from '../types';
import { PageHeader } from './PageHeader';
import './LinedPaper.css';
import './AchievedPage.css';

interface AchievedPageProps {
  items: BucketItem[];
  onOpen: (item: BucketItem) => void;
}

function monthLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function AchievedPage({ items, onOpen }: AchievedPageProps) {
  const achieved = [...items]
    .filter((i) => i.status === 'achieved' && i.achievedDate)
    .sort((a, b) => (b.achievedDate! < a.achievedDate! ? -1 : 1));

  const groups: { label: string; items: BucketItem[] }[] = [];
  for (const item of achieved) {
    const label = monthLabel(item.achievedDate!);
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }

  return (
    <div className="page">
      <PageHeader title="Achieved" subtitle={`${achieved.length} dreams come true`} />
      <div className="lined-paper">
        {achieved.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🏆</span>
            Nothing achieved yet.
            <br />
            Check something off your lists to see it here.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="month-label">{group.label}</div>
              {group.items.map((item) => (
                <button key={item.id} className="achieved-card" onClick={() => onOpen(item)}>
                  <div className="achieved-thumb">
                    {item.photos[0] ? (
                      <img src={item.photos[0]} alt="" />
                    ) : (
                      <span>{item.emoji}</span>
                    )}
                  </div>
                  <div className="achieved-card-text">
                    <span className="achieved-title">{item.title}</span>
                    {item.location && <span className="achieved-sub">{item.location}</span>}
                    <span className="achieved-date">✌🏻 {formatDate(item.achievedDate!)}</span>
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
