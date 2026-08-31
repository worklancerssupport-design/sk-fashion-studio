import React, { useState } from 'react';
import EditDesigns from './EditDesigns';
import ActionBar from './components/ActionBar';
import InlineEdit from './components/InlineEdit';
import ImageEditor from './components/ImageEditor';
import { DesignCategory } from './types';
import {
  Plus, X, Image as ImageIcon, Trash2,
} from 'lucide-react';

const LAYOUT_OPTIONS = [
  { value: 'feature-left', label: 'Feature Left' },
  { value: 'triple-grid', label: 'Triple Grid' },
  { value: 'editorial-right', label: 'Editorial Right' },
  { value: 'conversion-grid', label: 'Conversion Grid' },
  { value: 'masonry-wide', label: 'Masonry Wide' },
];

function CategoryBlock({
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
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [newSubcategory, setNewSubcategory] = useState('');
  const subs = category.subcategories || [];

  const addSubcategory = () => {
    const v = newSubcategory.trim();
    if (!v) return;
    onUpdate({ subcategories: [...subs, v] });
    setNewSubcategory('');
  };

  return (
    <article className="edit-category">
      <header className="edit-category-head">
        <div className="edit-category-head-left">
          <span className="edit-category-index">#{String(index + 1).padStart(2, '0')}</span>
          <span className="edit-category-label-display">
            {category.label || <em style={{ color: 'var(--muted)' }}>Untitled</em>}
          </span>
          <span className="edit-category-id-pill">{category.id || 'no-id'}</span>
        </div>
        <button
          className="edit-category-remove"
          onClick={onRemove}
          title="Delete this category"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </header>

      <div className="edit-category-body">
        <div className="edit-fields-grid">
          <div className="edit-field">
            <label>Category ID</label>
            <InlineEdit
              value={category.id}
              onChange={(v) => onUpdate({ id: v })}
              placeholder="e.g. bridal"
              mono
            />
          </div>
          <div className="edit-field">
            <label>Display Label</label>
            <InlineEdit
              value={category.label}
              onChange={(v) => onUpdate({ label: v })}
              placeholder="e.g. Bridal Couture"
            />
          </div>
          <div className="edit-field edit-field--full">
            <label>Description</label>
            <InlineEdit
              value={category.desc}
              onChange={(v) => onUpdate({ desc: v })}
              placeholder="Short description shown beneath the category title"
              multiline
            />
          </div>
          <div className="edit-field">
            <label>Layout Style</label>
            <select
              value={category.layout}
              onChange={(e) => onUpdate({ layout: e.target.value })}
              className="edit-select"
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="edit-field">
            <label>Images ({category.images.length})</label>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', paddingTop: '10px' }}>
              Manage images in the grid below ↓
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="edit-subs">
          <div className="edit-subs-head">
            <label style={{
              fontSize: '0.66rem',
              letterSpacing: '0.18em',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}>Subcategories</label>
          </div>
          <div className="edit-subs-list">
            {subs.length === 0 && (
              <span className="edit-subs-empty">No subcategories yet</span>
            )}
            {subs.map((sub, i) => (
              <span key={i} className="edit-sub-tag">
                {sub}
                <button
                  onClick={() => {
                    const next = subs.filter((_, idx) => idx !== i);
                    onUpdate({ subcategories: next.length ? next : undefined });
                  }}
                  title="Remove subcategory"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="edit-subs-add">
            <input
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              placeholder="Add a subcategory..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubcategory();
                }
              }}
            />
            <button
              className="edit-btn"
              onClick={addSubcategory}
              disabled={!newSubcategory.trim()}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="edit-images-head">
            <label style={{
              fontSize: '0.66rem',
              letterSpacing: '0.18em',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}>
              <ImageIcon size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Images
            </label>
          </div>
          <div className="edit-images-grid">
            {category.images.map((url, i) => (
              <div
                key={i}
                className="edit-image-tile"
                onClick={() => setEditingImageIndex(i)}
                title="Click to edit"
              >
                <img src={url} alt={`Image ${i + 1}`} />
                <div className="edit-image-tile-overlay">Edit</div>
                <button
                  className="edit-image-tile-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ images: category.images.filter((_, idx) => idx !== i) });
                  }}
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              className="edit-image-add"
              onClick={() => setEditingImageIndex(category.images.length)}
            >
              <Plus />
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
    </article>
  );
}

export default function EditDesignsEditor() {
  return (
    <EditDesigns>
      {({
        editData, loading, saving, error, hasChanges,
        refresh, save, discard,
        updateCategory, addCategory, removeCategory,
      }) => {
        if (loading) {
          return (
            <div className="edit-state">
              <div className="edit-spinner-lg" />
              <p className="edit-state-text">Loading designs from GitHub...</p>
            </div>
          );
        }

        if (!editData) {
          return (
            <div className="edit-state">
              <h3 className="edit-state-title">Failed to load</h3>
              <p className="edit-state-text">{error || 'Could not load designs data from GitHub.'}</p>
              <button className="edit-btn edit-btn--primary" onClick={refresh}>Try Again</button>
            </div>
          );
        }

        return (
          <>
            <div className="edit-page-head">
              <div className="edit-page-eyebrow">Edit Console</div>
              <h1 className="edit-page-title">
                Explore <em>Designs</em>
              </h1>
              <p className="edit-page-subtitle">
                Edit the design categories shown in the "Explore Our Designs" section on the homepage.
                Changes save directly to GitHub and go live on the next deploy.
              </p>
            </div>

            <ActionBar
              hasChanges={hasChanges}
              loading={loading}
              saving={saving}
              error={error}
              filePath="src/data/designs.json"
              onRefresh={refresh}
              onDiscard={discard}
              onSave={save}
            />

            <section className="edit-section">
              <div className="edit-section-head">
                <div className="edit-section-head-text">
                  <div className="edit-section-eyebrow">Section 01</div>
                  <h2 className="edit-section-title">Design Categories</h2>
                  <p className="edit-section-desc">
                    Each card below is one category displayed on the website. Edit the fields directly — they're saved when you click <strong>Save Changes</strong>.
                  </p>
                </div>
              </div>

              <div className="edit-categories">
                {editData.categories.map((cat, i) => (
                  <CategoryBlock
                    key={cat.id || i}
                    category={cat}
                    index={i}
                    onUpdate={(updates) => updateCategory(i, updates)}
                    onRemove={() => removeCategory(i)}
                  />
                ))}
              </div>

              <button
                className="edit-add-category"
                onClick={() => addCategory({
                  id: `new-category-${Date.now()}`,
                  label: 'New Category',
                  desc: 'Description for the new category.',
                  layout: 'triple-grid',
                  images: [],
                })}
              >
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </section>
          </>
        );
      }}
    </EditDesigns>
  );
}
