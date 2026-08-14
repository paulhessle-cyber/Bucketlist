import { useRef, useState } from 'react';
import type { BucketItem } from '../types';
import './AchievedDetail.css';

interface AchievedDetailProps {
  item: BucketItem;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<BucketItem>) => void;
  onUnachieve: (id: string) => void;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

export function AchievedDetail({ item, onClose, onUpdate, onUnachieve }: AchievedDetailProps) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(item.description ?? '');
  const [location, setLocation] = useState(item.location ?? '');
  const [coverIndex, setCoverIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cover = item.photos[coverIndex];

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((dataUrls) => {
      onUpdate(item.id, { photos: [...item.photos, ...dataUrls] });
    });
  }

  function save() {
    onUpdate(item.id, { description, location: location || undefined });
    setEditing(false);
  }

  return (
    <div className="detail-overlay">
      <div className="detail-cover">
        {cover ? (
          <img src={cover} alt={item.title} />
        ) : (
          <div className="detail-cover-placeholder">
            <span>{item.emoji}</span>
          </div>
        )}
        <div className="detail-cover-top">
          <button className="pill-btn" onClick={() => setEditing((v) => !v)}>
            ✏️ {editing ? 'Done' : 'Edit'}
          </button>
          <button className="round-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="detail-thumbs">
          {item.photos.map((p, i) => (
            <button
              key={i}
              className={`detail-thumb ${i === coverIndex ? 'active' : ''}`}
              onClick={() => setCoverIndex(i)}
            >
              <img src={p} alt="" />
            </button>
          ))}
          <button className="detail-thumb add" onClick={() => fileInputRef.current?.click()}>
            +
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      <div className="detail-sheet">
        <h1>{item.title}</h1>
        <div className="detail-status">✌🏻 Achieved · {formatDate(item.achievedDate)}</div>

        <div className="detail-field">
          <span className="detail-field-label">📍 Location</span>
          {editing ? (
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a location"
            />
          ) : (
            <p className="detail-field-value">{item.location || 'No location added'}</p>
          )}
        </div>

        <div className="detail-field">
          <span className="detail-field-label">📝 Description</span>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How did it go?"
            />
          ) : (
            <p className="detail-field-value">{item.description || 'No description yet.'}</p>
          )}
        </div>

        {editing ? (
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              📷 Add photos
            </button>
            <button className="btn btn-primary" onClick={save}>
              Save
            </button>
          </div>
        ) : (
          <button className="unachieve-link" onClick={() => onUnachieve(item.id)}>
            Move back to active list
          </button>
        )}
      </div>
    </div>
  );
}
