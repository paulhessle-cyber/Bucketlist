import { useState } from 'react';
import type { BucketItem, ListKind } from '../types';
import { Modal } from './Modal';
import './Modal.css';

const EMOJI_CHOICES = ['🎯', '🏔️', '🏄', '🐬', '📖', '🦁', '🏃', '✈️', '🌅', '🎈', '🚗', '🏠', '🎉', '📷', '🍜'];

interface ItemFormModalProps {
  kind: ListKind;
  initial?: BucketItem;
  onClose: () => void;
  onSave: (data: Pick<BucketItem, 'title' | 'emoji' | 'location' | 'targetDate'>) => void;
  onDelete?: () => void;
}

export function ItemFormModal({ kind, initial, onClose, onSave, onDelete }: ItemFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJI_CHOICES[0]);
  const [location, setLocation] = useState(initial?.location ?? '');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');

  const canSave = title.trim().length > 0;

  return (
    <Modal
      title={initial ? 'Edit item' : kind === 'travel' ? 'Add travel plan' : 'Add to bucket list'}
      onClose={onClose}
      footer={
        <>
          {onDelete && (
            <button className="btn btn-danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.5 }}
            onClick={() =>
              canSave &&
              onSave({
                title: title.trim(),
                emoji,
                location: location.trim() || undefined,
                targetDate: targetDate || undefined,
              })
            }
          >
            Save
          </button>
        </>
      }
    >
      <div className="field">
        <label>What's the dream?</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === 'travel' ? 'e.g. Trek to Everest Base Camp' : 'e.g. Learn to surf'}
          autoFocus
        />
      </div>
      <div className="field">
        <label>{kind === 'travel' ? 'Destination' : 'Location (optional)'}</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Quang Binh, Vietnam"
        />
      </div>
      <div className="field">
        <label>Target date (optional)</label>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      <div className="field">
        <label>Icon</label>
        <div className="emoji-grid">
          {EMOJI_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              className={`emoji-choice ${emoji === choice ? 'selected' : ''}`}
              onClick={() => setEmoji(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
