import React, { useState } from 'react';
import EditServices from './EditServices';
import ActionBar from './components/ActionBar';
import InlineEdit from './components/InlineEdit';
import ImageEditor from './components/ImageEditor';
import { Service } from './types';
import {
  Plus, X, Image as ImageIcon, Trash2,
} from 'lucide-react';

function ServiceBlock({
  service,
  index,
  onUpdate,
  onRemove,
  onUpdateArrayField,
}: {
  service: Service;
  index: number;
  onUpdate: (updates: Partial<Service>) => void;
  onRemove: () => void;
  onUpdateArrayField: (field: keyof Service, value: string[]) => void;
}) {
  const [editingImage, setEditingImage] = useState(false);
  const [newIncluded, setNewIncluded] = useState('');
  const [newOccasion, setNewOccasion] = useState('');
  const [newCustomization, setNewCustomization] = useState('');

  const addArrayItem = (field: keyof Service, value: string, setter: (v: string) => void) => {
    const v = value.trim();
    if (!v) return;
    const current = (service[field] as string[]) || [];
    onUpdateArrayField(field, [...current, v]);
    setter('');
  };

  const removeArrayItem = (field: keyof Service, itemIndex: number) => {
    const current = (service[field] as string[]) || [];
    onUpdateArrayField(field, current.filter((_, idx) => idx !== itemIndex));
  };

  return (
    <article className="edit-category">
      <header className="edit-category-head">
        <div className="edit-category-head-left">
          <span className="edit-category-index">#{service.number || String(index + 1).padStart(2, '0')}</span>
          <span className="edit-category-label-display">
            {service.title || <em style={{ color: 'var(--muted)' }}>Untitled</em>}
          </span>
          <span className="edit-category-id-pill">{service.id || 'no-id'}</span>
        </div>
        <button
          className="edit-category-remove"
          onClick={onRemove}
          title="Delete this service"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </header>

      <div className="edit-category-body">
        <div className="edit-fields-grid">
          <div className="edit-field">
            <label>Service ID</label>
            <InlineEdit
              value={service.id}
              onChange={(v) => onUpdate({ id: v })}
              placeholder="e.g. bridal-blouses"
              mono
            />
          </div>
          <div className="edit-field">
            <label>Number</label>
            <InlineEdit
              value={service.number}
              onChange={(v) => onUpdate({ number: v })}
              placeholder="e.g. 01"
              mono
            />
          </div>
          <div className="edit-field">
            <label>Title</label>
            <InlineEdit
              value={service.title}
              onChange={(v) => onUpdate({ title: v })}
              placeholder="e.g. Bridal Blouses & Couture"
            />
          </div>
          <div className="edit-field">
            <label>Badge</label>
            <InlineEdit
              value={service.badge}
              onChange={(v) => onUpdate({ badge: v })}
              placeholder="e.g. Signature Bridal"
            />
          </div>
          <div className="edit-field edit-field--full">
            <label>Short Description</label>
            <InlineEdit
              value={service.shortDesc}
              onChange={(v) => onUpdate({ shortDesc: v })}
              placeholder="Brief description shown on the service card"
              multiline
            />
          </div>
          <div className="edit-field edit-field--full">
            <label>Full Description</label>
            <InlineEdit
              value={service.fullDesc}
              onChange={(v) => onUpdate({ fullDesc: v })}
              placeholder="Detailed description shown in the service modal"
              multiline
            />
          </div>
          <div className="edit-field">
            <label>Outfit Key</label>
            <InlineEdit
              value={service.outfitKey}
              onChange={(v) => onUpdate({ outfitKey: v })}
              placeholder="e.g. Bridal Blouse"
            />
          </div>
          <div className="edit-field">
            <label>Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10 }}>
              {service.image && (
                <img
                  src={service.image}
                  alt=""
                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <button className="edit-btn" onClick={() => setEditingImage(true)}>
                <ImageIcon size={14} />
                <span>Edit Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Whats Included */}
        <div className="edit-subs">
          <div className="edit-subs-head">
            <label style={{
              fontSize: '0.66rem',
              letterSpacing: '0.18em',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}>What's Included</label>
          </div>
          <div className="edit-subs-list">
            {(service.whatsIncluded || []).length === 0 && (
              <span className="edit-subs-empty">No items yet</span>
            )}
            {(service.whatsIncluded || []).map((item, i) => (
              <span key={i} className="edit-sub-tag">
                {item}
                <button
                  onClick={() => removeArrayItem('whatsIncluded', i)}
                  title="Remove item"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="edit-subs-add">
            <input
              value={newIncluded}
              onChange={(e) => setNewIncluded(e.target.value)}
              placeholder="Add an included item..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('whatsIncluded', newIncluded, setNewIncluded);
                }
              }}
            />
            <button
              className="edit-btn"
              onClick={() => addArrayItem('whatsIncluded', newIncluded, setNewIncluded)}
              disabled={!newIncluded.trim()}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Suitable Occasions */}
        <div className="edit-subs">
          <div className="edit-subs-head">
            <label style={{
              fontSize: '0.66rem',
              letterSpacing: '0.18em',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}>Suitable Occasions</label>
          </div>
          <div className="edit-subs-list">
            {(service.suitableOccasions || []).length === 0 && (
              <span className="edit-subs-empty">No occasions yet</span>
            )}
            {(service.suitableOccasions || []).map((item, i) => (
              <span key={i} className="edit-sub-tag">
                {item}
                <button
                  onClick={() => removeArrayItem('suitableOccasions', i)}
                  title="Remove occasion"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="edit-subs-add">
            <input
              value={newOccasion}
              onChange={(e) => setNewOccasion(e.target.value)}
              placeholder="Add an occasion..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('suitableOccasions', newOccasion, setNewOccasion);
                }
              }}
            />
            <button
              className="edit-btn"
              onClick={() => addArrayItem('suitableOccasions', newOccasion, setNewOccasion)}
              disabled={!newOccasion.trim()}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Customization Options */}
        <div className="edit-subs">
          <div className="edit-subs-head">
            <label style={{
              fontSize: '0.66rem',
              letterSpacing: '0.18em',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}>Customization Options</label>
          </div>
          <div className="edit-subs-list">
            {(service.customizationOptions || []).length === 0 && (
              <span className="edit-subs-empty">No options yet</span>
            )}
            {(service.customizationOptions || []).map((item, i) => (
              <span key={i} className="edit-sub-tag">
                {item}
                <button
                  onClick={() => removeArrayItem('customizationOptions', i)}
                  title="Remove option"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="edit-subs-add">
            <input
              value={newCustomization}
              onChange={(e) => setNewCustomization(e.target.value)}
              placeholder="Add a customization option..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('customizationOptions', newCustomization, setNewCustomization);
                }
              }}
            />
            <button
              className="edit-btn"
              onClick={() => addArrayItem('customizationOptions', newCustomization, setNewCustomization)}
              disabled={!newCustomization.trim()}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {editingImage && (
          <ImageEditor
            currentUrl={service.image || ''}
            onSave={(url) => onUpdate({ image: url })}
            onClose={() => setEditingImage(false)}
          />
        )}
      </div>
    </article>
  );
}

export default function EditServicesEditor() {
  return (
    <EditServices>
      {({
        editData, loading, saving, error, hasChanges,
        refresh, save, discard,
        updateService, addService, removeService, updateServiceArrayField,
      }) => {
        if (loading) {
          return (
            <div className="edit-state">
              <div className="edit-spinner-lg" />
              <p className="edit-state-text">Loading services...</p>
            </div>
          );
        }

        if (!editData) {
          return (
            <div className="edit-state">
              <h3 className="edit-state-title">Failed to load</h3>
              <p className="edit-state-text">{error || 'Could not load services data.'}</p>
              <button className="edit-btn edit-btn--primary" onClick={refresh}>Try Again</button>
            </div>
          );
        }

        return (
          <>
            <div className="edit-page-head">
              <div className="edit-page-eyebrow">Edit Console</div>
              <h1 className="edit-page-title">
                Our <em>Services</em>
              </h1>
              <p className="edit-page-subtitle">
                Edit the services shown in the "Our Services" section on the homepage.
                Changes save and go live on the next deploy.
              </p>
            </div>

            <ActionBar
              hasChanges={hasChanges}
              loading={loading}
              saving={saving}
              error={error}
              filePath="src/data/services.json"
              onRefresh={refresh}
              onDiscard={discard}
              onSave={save}
            />

            <section className="edit-section">
              <div className="edit-section-head">
                <div className="edit-section-head-text">
                  <div className="edit-section-eyebrow">Section 02</div>
                  <h2 className="edit-section-title">Services</h2>
                  <p className="edit-section-desc">
                    Each card below is one service displayed on the website. Edit the fields directly — they're saved when you click <strong>Save Changes</strong>.
                  </p>
                </div>
              </div>

              <div className="edit-categories">
                {editData.map((svc, i) => (
                  <ServiceBlock
                    key={svc.id || i}
                    service={svc}
                    index={i}
                    onUpdate={(updates) => updateService(i, updates)}
                    onRemove={() => removeService(i)}
                    onUpdateArrayField={(field, value) => updateServiceArrayField(i, field, value)}
                  />
                ))}
              </div>

              <button
                className="edit-add-category"
                onClick={() => addService({
                  id: `new-service-${Date.now()}`,
                  number: String(editData.length + 1).padStart(2, '0'),
                  title: 'New Service',
                  badge: 'New',
                  shortDesc: 'Description for the new service.',
                  image: '',
                  fullDesc: 'Full description for the new service.',
                  whatsIncluded: [],
                  suitableOccasions: [],
                  customizationOptions: [],
                  outfitKey: 'New Service',
                })}
              >
                <Plus size={16} />
                <span>Add Service</span>
              </button>
            </section>
          </>
        );
      }}
    </EditServices>
  );
}
