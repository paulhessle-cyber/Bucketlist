import { useState } from 'react';
import { Modal } from './Modal';
import { useCountryFeatures } from './WorldMap';
import './CountryPickerModal.css';

interface CountryPickerModalProps {
  visitedIds: Set<string>;
  onClose: () => void;
  onToggleCountry: (id: string, name: string) => void;
}

export function CountryPickerModal({ visitedIds, onClose, onToggleCountry }: CountryPickerModalProps) {
  const countries = useCountryFeatures();
  const [query, setQuery] = useState('');

  const filtered = countries.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal title="Add countries visited" onClose={onClose}>
      <div className="field">
        <input
          type="text"
          placeholder="Search countries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="country-list">
        {filtered.map((c) => {
          const visited = visitedIds.has(c.id);
          return (
            <button
              key={c.id}
              className={`country-list-row ${visited ? 'visited' : ''}`}
              onClick={() => onToggleCountry(c.id, c.name)}
            >
              <span>{c.name}</span>
              <span className="country-check">{visited ? '✌🏻' : ''}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
