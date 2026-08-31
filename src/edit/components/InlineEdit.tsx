import React from 'react';

interface InlineEditProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  mono?: boolean;
}

export default function InlineEdit({
  value,
  onChange,
  className,
  placeholder,
  multiline,
  mono,
}: InlineEditProps) {
  const cls = [
    mono ? 'edit-input edit-input--mono' : 'edit-input',
    multiline ? 'edit-textarea' : '',
    className || '',
  ].filter(Boolean).join(' ');

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cls}
        rows={3}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cls}
    />
  );
}
