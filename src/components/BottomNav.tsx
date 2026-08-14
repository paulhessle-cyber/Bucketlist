import './BottomNav.css';

export type TabKey = 'my-list' | 'travel-list' | 'achieved';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'my-list', label: 'My List', icon: '📋' },
  { key: 'travel-list', label: 'Travel List', icon: '🗺️' },
  { key: 'achieved', label: 'Achieved', icon: '🏆' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`bottom-nav-btn ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
