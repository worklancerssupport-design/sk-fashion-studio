import React, { useState } from 'react';
import EditDesigns from './EditDesigns';
import ActionBar from './components/ActionBar';
import InlineEdit from './components/InlineEdit';
import ImageEditor from './components/ImageEditor';
import { DesignCategory } from './types';
import {
  Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronRight,
  GripVertical, Tag, Layout, X
} from 'lucide-react';

const LAYOUT_OPTIONS = ['feature-left', 'triple-grid', 'editorial-right', 'conversion-grid', 'masonry-wide'];

function CategoryCard({
  category,
  index,
  onUpdate,
  onRemove,
}: {
  category: DesignCategory;
  index: number;
  onUpdate: (updates: Partial<DesignCategory>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [newSubcategory, setNewSubcategory] = useState('');

  return (
    <div className="edit-category-card">
      <div className="edit-category-header" onClick={() => setExpanded(!expanded)}>
        <div className="edit-category-header-left">
          <GripVertical size={16} className="edit-grip" />
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="edit-category-number">#{index + 1}</span>
          <span className="edit-category-title">{category.label}</span>
          <span className="edit-category-id">{category.id}</span>
          <span className="edit-category-layout">{category.layout}</span>
          <span className="edit-category-images">{category.images.length} images</span>
        </div>
        <button
          className="edit-remove-btn"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Delete category"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="edit-category-body">
          <div className="edit-category-fields">
            <div className="edit-field-group">
              <label>ID</label>
              <InlineEdit value={category.id} onChange={(v) => onUpdate({ id: v })} className="edit-field-input" />
            </div>
            <div className="edit-field-group">
              <label>Label</label>
              <InlineEdit value={category.label} onChange={(v) => onUpdate({ label: v })} className="edit-field-input" />
            </div>
            <div className="edit-field-group edit-field-group--wide">
              <label>Description</label>
              <InlineEdit value={category.desc} onChange={(v) => onUpdate({ desc: v })} className="edit-field-input" multiline />
            </div>
            <div className="edit-field-group">
              <label>Layout</label>
              <select
                value={category.layout}
                onChange={(e) => onUpdate({ layout: e.target.value })}
                className="edit-field-select"
              >
                {LAYOUT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategories */}
          <div className="edit-subcategories">
            <label><Tag size={14} /> Subcategories</label>
            <div className="edit-subcategory-list">
              {(category.subcategories || []).map((sub, i) => (
                <span key={i} className="edit-subcategory-tag">
                  {sub}
                  <button onClick={() => {
                    const updated = [...(category.subcategories || [])];
                    updated.splice(i, 1);
                    onUpdate({ subcategories: updated.length ? updated : undefined });
                  }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="edit-subcategory-add">
              <input
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="Add subcategory..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubcategory.trim()) {
                    onUpdate({ subcategories: [...(category.subcategories || []), newSubcategory.trim()] });
                    setNewSubcategory('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newSubcategory.trim()) {
                    onUpdate({ subcategories: [...(category.subcategories || []), newSubcategory.trim()] });
                    setNewSubcategory('');
                  }
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="edit-images-section">
            <label><ImageIcon size={14} /> Images ({category.images.length})</label>
            <div className="edit-images-grid">
              {category.images.map((url, i) => (
                <div key={i} className="edit-image-thumb" onClick={() => setEditingImageIndex(i)}>
                  <img src={url} alt={`Image ${i + 1}`} />
                  <div className="edit-image-thumb-overlay">
                    <span>Edit</span>
                  </div>
                  <button
                    className="edit-image-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = category.images.filter((_, idx) => idx !== i);
                      onUpdate({ images: updated });
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                className="edit-image-add"
                onClick={() => setEditingImageIndex(category.images.length)}
              >
                <Plus size={24} />
                <span>Add Image</span>
              </button>
            </div>
          </div>

          {editingImageIndex !== null && (
            <ImageEditor
              currentUrl={category.images[editingImageIndex] || ''}
              onSave={(url) => {
                const updated = [...category.images];
                if (editingImageIndex < updated.length) {
                  updated[editingImageIndex] = url;
                } else {
                  updated.push(url);
                }
                onUpdate({ images: updated });
              }}
              onClose={() => setEditingImageIndex(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function NavLabelsEditor({
  navLabels,
  onUpdate,
  onAdd,
  onRemove,
}: {
  navLabels: Record<string, string>;
  onUpdate: (key: string, value: string) => void;
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string) => void;
}) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  return (
    <div className="edit-navlabels-section">
      <h3><Layout size={18} /> Navigation Labels</h3>
      <p className="edit-section-desc">Map category IDs to their short navigation labels.</p>
      <div className="edit-navlabels-list">
        {Object.entries(navLabels).map(([key, value]) => (
          <div key={key} className="edit-navlabel-row">
            <span className="edit-navlabel-key">{key}</span>
            <InlineEdit value={value} onChange={(v) => onUpdate(key, v)} className="edit-navlabel-value" />
            <button className="edit-remove-btn" onClick={() => onRemove(key)} title="Remove label">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="edit-navlabel-add">
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Category ID"
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Nav Label"
        />
        <button
          className="edit-action-btn"
          onClick={() => {
            if (newKey.trim() && newValue.trim()) {
              onAdd(newKey.trim(), newValue.trim());
              setNewKey('');
              setNewValue('');
            }
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

export default function EditDesignsEditor() {
  return (
    <EditDesigns>
      {({ editData, loading, saving, error, hasChanges, refresh, save, discard, updateCategory, addCategory, removeCategory, updateNavLabel, addNavLabel, removeNavLabel }) => {
        if (loading) {
          return (
            <div className="edit-loading">
              <div className="edit-spinner-large" />
              <p>Loading designs from GitHub...</p>
            </div>
          );
        }

        if (!editData) {
          return (
            <div className="edit-error-state">
              <p>Failed to load designs data.</p>
              <button className="edit-action-btn" onClick={refresh}>Retry</button>
            </div>
          );
        }

        return (
          <>
            <ActionBar
              hasChanges={hasChanges}
              loading={loading}
              saving={saving}
              error={error}
              onRefresh={refresh}
              onDiscard={discard}
              onSave={save}
            />

            <div className="edit-section">
              <h2>Explore Designs Categories</h2>
              <p className="edit-section-desc">
                Manage the design categories shown in the "Explore Our Designs" section of the website.
              </p>

              <div className="edit-categories-list">
                {editData.categories.map((cat, i) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    index={i}
                    onUpdate={(updates) => updateCategory(i, updates)}
                    onRemove={() => removeCategory(i)}
                  />
                ))}
              </div>

              <button
                className="edit-add-category-btn"
                onClick={() => addCategory({
                  id: 'new-category',
                  label: 'New Category',
                  desc: 'Description for the new category.',
                  layout: 'triple-grid',
                  images: [],
                })}
              >
                <Plus size={18} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="edit-section">
              <NavLabelsEditor
                navLabels={editData.navLabels}
                onUpdate={updateNavLabel}
                onAdd={addNavLabel}
                onRemove={removeNavLabel}
              />
            </div>
          </>
        );
      }}
    </EditDesigns>
  );
}
