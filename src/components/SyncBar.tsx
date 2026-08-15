import type { User } from 'firebase/auth';
import './SyncBar.css';

interface SyncBarProps {
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function SyncBar({ user, authLoading, onSignIn, onSignOut }: SyncBarProps) {
  if (authLoading) return null;

  return (
    <div className="sync-bar">
      {user ? (
        <>
          <span className="sync-status">☁️ Synced as {user.displayName ?? user.email}</span>
          <button className="sync-action" onClick={onSignOut}>
            Sign out
          </button>
        </>
      ) : (
        <button className="sync-action sync-signin" onClick={onSignIn}>
          ☁️ Sign in to sync your list
        </button>
      )}
    </div>
  );
}
