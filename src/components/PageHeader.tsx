import type { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, onAdd, right }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-header-actions">
        {right}
        {onAdd && (
          <button className="add-btn" onClick={onAdd} aria-label="Add">
            +
          </button>
        )}
      </div>
    </header>
  );
}
