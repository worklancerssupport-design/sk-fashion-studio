import React from 'react';
import { RefreshCw, Undo2, Save, AlertCircle, Check } from 'lucide-react';

interface ActionBarProps {
  hasChanges: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  filePath?: string;
  onRefresh: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export default function ActionBar({
  hasChanges,
  loading,
  saving,
  error,
  filePath,
  onRefresh,
  onDiscard,
  onSave,
}: ActionBarProps) {
  return (
    <div className="edit-action-bar">
      <div className="edit-action-bar-info">
        {filePath && <span className="edit-action-bar-file">{filePath}</span>}
        {error ? (
          <span className="edit-status-badge edit-status-badge--error">
            <AlertCircle size={13} />
            {error}
          </span>
        ) : hasChanges ? (
          <span className="edit-status-badge edit-status-badge--unsaved">
            <AlertCircle size={13} />
            Unsaved changes
          </span>
        ) : !loading && !saving ? (
          <span className="edit-status-badge edit-status-badge--saved">
            <Check size={13} />
            All changes saved
          </span>
        ) : null}
      </div>

      <div className="edit-action-bar-buttons">
        <button
          className="edit-btn"
          onClick={onRefresh}
          disabled={loading || saving}
          title="Refresh data"
        >
          <RefreshCw size={14} className={loading ? 'edit-spin' : ''} />
          <span>Refresh</span>
        </button>
        <button
          className="edit-btn"
          onClick={onDiscard}
          disabled={!hasChanges || loading || saving}
          title="Discard changes"
        >
          <Undo2 size={14} />
          <span>Discard</span>
        </button>
        <button
          className="edit-btn edit-btn--primary"
          onClick={onSave}
          disabled={!hasChanges || loading || saving}
          title="Save changes"
        >
          {saving ? <span className="edit-spinner" /> : <Save size={14} />}
          <span>{saving ? 'Saving' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
