import React, { useState, useRef, useEffect } from 'react';

interface InlineEditProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export default function InlineEdit({ value, onChange, className, placeholder, multiline }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") cancel(); }}
          onBlur={commit}
          className={className}
          rows={3}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        onBlur={commit}
        className={className}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => { setDraft(value); setEditing(true); }}
      className={`${className || ''} inline-edit-trigger`}
      title="Double-click to edit"
    >
      {value || <span className="inline-edit-placeholder">{placeholder || '—'}</span>}
    </span>
  );
}
