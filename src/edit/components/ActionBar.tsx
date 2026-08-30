import React from 'react';
import { RefreshCw, Undo2, Save, AlertCircle, Check } from 'lucide-react';

interface ActionBarProps {
  hasChanges: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onRefresh: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export default function ActionBar({ hasChanges, loading, saving, error, onRefresh, onDiscard, onSave }: ActionBarProps) {
  return (
    <div className="edit-action-bar">
      <div className="edit-action-bar-left">
        {hasChanges && (
          <span className="edit-unsaved-badge">
            <AlertCircle size={14} />
            Unsaved changes
          </span>
        )}
        {!hasChanges && !loading && !saving && (
          <span className="edit-saved-badge">
            <Check size={14} />
            All changes saved
          </span>
        )}
        {error && (
          <span className="edit-error-badge">
            <AlertCircle size={14} />
            {error}
          </span>
        )}
      </div>
      <div className="edit-action-bar-right">
        <button className="edit-action-btn" onClick={onRefresh} disabled={loading || saving} title="Refresh from GitHub">
          <RefreshCw size={16} className={loading ? 'edit-spin' : ''} />
          <span>Refresh</span>
        </button>
        <button className="edit-action-btn" onClick={onDiscard} disabled={!hasChanges || loading || saving} title="Discard changes">
          <Undo2 size={16} />
          <span>Discard</span>
        </button>
        <button className="edit-action-btn edit-action-btn--save" onClick={onSave} disabled={!hasChanges || loading || saving} title="Save to GitHub">
          {saving ? <span className="edit-spinner" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}
