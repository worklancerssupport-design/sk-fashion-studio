import React, { useState } from 'react';
import EditShopPhotos from './EditShopPhotos';
import ActionBar from './components/ActionBar';
import InlineEdit from './components/InlineEdit';
import ImageEditor from './components/ImageEditor';
import { ShopPhoto } from './types';
import {
  Plus, X, Image as ImageIcon, Trash2,
} from 'lucide-react';

function PhotoBlock({
  photo,
  index,
  onUpdate,
  onRemove,
}: {
  photo: ShopPhoto;
  index: number;
  onUpdate: (updates: Partial<ShopPhoto>) => void;
  onRemove: () => void;
}) {
  const [editingImage, setEditingImage] = useState(false);

  return (
    <article className="edit-category">
      <header className="edit-category-head">
        <div className="edit-category-head-left">
          <span className="edit-category-index">#{String(index + 1).padStart(2, '0')}</span>
          <span className="edit-category-label-display">
            {photo.title || <em style={{ color: 'var(--muted)' }}>Untitled</em>}
          </span>
          {photo.tag && <span className="edit-category-id-pill">{photo.tag}</span>}
        </div>
        <button
          className="edit-category-remove"
          onClick={onRemove}
          title="Delete this photo"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </header>

      <div className="edit-category-body">
        <div className="edit-fields-grid">
          <div className="edit-field">
            <label>Title</label>
            <InlineEdit
              value={photo.title}
              onChange={(v) => onUpdate({ title: v })}
              placeholder="e.g. Our Boutique"
            />
          </div>
          <div className="edit-field">
            <label>Tag</label>
            <InlineEdit
              value={photo.tag}
              onChange={(v) => onUpdate({ tag: v })}
              placeholder="e.g. Boutique Exterior"
            />
          </div>
          <div className="edit-field edit-field--full">
            <label>Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10 }}>
              {photo.url && (
                <img
                  src={photo.url}
                  alt=""
                  style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <button className="edit-btn" onClick={() => setEditingImage(true)}>
                <ImageIcon size={14} />
                <span>Edit Image</span>
              </button>
            </div>
          </div>
        </div>

        {editingImage && (
          <ImageEditor
            currentUrl={photo.url || ''}
            onSave={(url) => onUpdate({ url: url })}
            onClose={() => setEditingImage(false)}
          />
        )}
      </div>
    </article>
  );
}

export default function EditShopPhotosEditor() {
  return (
    <EditShopPhotos>
      {({
        editData, loading, saving, error, hasChanges,
        refresh, save, discard,
        updatePhoto, addPhoto, removePhoto,
      }) => {
        if (loading) {
          return (
            <div className="edit-state">
              <div className="edit-spinner-lg" />
              <p className="edit-state-text">Loading shop photos...</p>
            </div>
          );
        }

        if (!editData) {
          return (
            <div className="edit-state">
              <h3 className="edit-state-title">Failed to load</h3>
              <p className="edit-state-text">{error || 'Could not load shop photos data.'}</p>
              <button className="edit-btn edit-btn--primary" onClick={refresh}>Try Again</button>
            </div>
          );
        }

        return (
          <>
            <div className="edit-page-head">
              <div className="edit-page-eyebrow">Edit Console</div>
              <h1 className="edit-page-title">
                Shop <em>Photos</em>
              </h1>
              <p className="edit-page-subtitle">
                Edit the shop photos shown in the gallery section on the homepage.
                Changes save and go live on the next deploy.
              </p>
            </div>

            <ActionBar
              hasChanges={hasChanges}
              loading={loading}
              saving={saving}
              error={error}
              filePath="src/data/shopPhotos.json"
              onRefresh={refresh}
              onDiscard={discard}
              onSave={save}
            />

            <section className="edit-section">
              <div className="edit-section-head">
                <div className="edit-section-head-text">
                  <div className="edit-section-eyebrow">Section 03</div>
                  <h2 className="edit-section-title">Shop Photos</h2>
                  <p className="edit-section-desc">
                    Each entry below is one photo in the shop gallery. Edit the fields directly — they're saved when you click <strong>Save Changes</strong>.
                  </p>
                </div>
              </div>

              <div className="edit-categories">
                {editData.map((photo, i) => (
                  <PhotoBlock
                    key={i}
                    photo={photo}
                    index={i}
                    onUpdate={(updates) => updatePhoto(i, updates)}
                    onRemove={() => removePhoto(i)}
                  />
                ))}
              </div>

              <button
                className="edit-add-category"
                onClick={() => addPhoto({
                  title: 'New Photo',
                  tag: 'New',
                  url: '',
                })}
              >
                <Plus size={16} />
                <span>Add Photo</span>
              </button>
            </section>
          </>
        );
      }}
    </EditShopPhotos>
  );
}
