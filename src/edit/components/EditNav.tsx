import React from 'react';
import { Layers, Sparkles, Images } from 'lucide-react';

export type EditSection = 'designs' | 'services' | 'shopPhotos';

interface NavTab {
  id: EditSection;
  label: string;
  icon: React.ReactNode;
}

const TABS: NavTab[] = [
  { id: 'designs', label: 'Designs', icon: <Layers size={14} /> },
  { id: 'services', label: 'Services', icon: <Sparkles size={14} /> },
  { id: 'shopPhotos', label: 'Shop Photos', icon: <Images size={14} /> },
];

interface EditNavProps {
  selected: EditSection;
  onSelect: (section: EditSection) => void;
}

export default function EditNav({ selected, onSelect }: EditNavProps) {
  return (
    <ul className="edit-nav-tabs">
      {TABS.map((tab) => {
        const isActive = selected === tab.id;
        return (
          <li key={tab.id}>
            <button
              type="button"
              className={`edit-nav-tab ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelect(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="edit-nav-tab-icon">{tab.icon}</span>
              <span className="edit-nav-tab-label">{tab.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export { TABS };
