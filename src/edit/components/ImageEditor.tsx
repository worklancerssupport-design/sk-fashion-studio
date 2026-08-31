import React, { useState } from 'react';
import { X, Link, Upload, Camera, Loader2, AlertCircle } from 'lucide-react';
import { compressAndUpload, selectFromFile, captureFromCamera } from '../lib/cloudinary';

interface ImageEditorProps {
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export default function ImageEditor({ currentUrl, onSave, onClose }: ImageEditorProps) {
  const [url, setUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'url' | 'upload' | 'camera'>('url');

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await compressAndUpload(file, 1200, 0.8, 'sk-fashion/designs');
      setUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (url.trim()) {
      onSave(url.trim());
      onClose();
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-head">
          <div>
            <div className="edit-modal-eyebrow">Image</div>
            <h3 className="edit-modal-title">Edit Image</h3>
          </div>
          <button className="edit-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="edit-modal-tabs">
          <button
            className={`edit-modal-tab ${tab === 'url' ? 'active' : ''}`}
            onClick={() => setTab('url')}
          >
            <Link size={14} /> URL
          </button>
          <button
            className={`edit-modal-tab ${tab === 'upload' ? 'active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <Upload size={14} /> Upload
          </button>
          <button
            className={`edit-modal-tab ${tab === 'camera' ? 'active' : ''}`}
            onClick={() => setTab('camera')}
          >
            <Camera size={14} /> Camera
          </button>
        </div>

        <div className="edit-modal-body">
          {tab === 'url' && (
            <div className="edit-modal-field">
              <label>Image URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {tab === 'upload' && (
            <div className="edit-modal-upload">
              <button
                className="edit-modal-upload-btn"
                onClick={() => selectFromFile().then(handleFileUpload)}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={18} className="edit-spin" /> : <Upload size={18} />}
                <span>{uploading ? 'Uploading' : 'Choose File'}</span>
              </button>
            </div>
          )}

          {tab === 'camera' && (
            <div className="edit-modal-upload">
              <button
                className="edit-modal-upload-btn"
                onClick={() => captureFromCamera().then(handleFileUpload)}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={18} className="edit-spin" /> : <Camera size={18} />}
                <span>{uploading ? 'Uploading' : 'Take Photo'}</span>
              </button>
            </div>
          )}

          {error && (
            <div className="edit-modal-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {url && (
            <div className="edit-modal-preview">
              <img
                src={url}
                alt="Preview"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        <div className="edit-modal-foot">
          <button className="edit-btn" onClick={onClose}>Cancel</button>
          <button
            className="edit-btn edit-btn--primary"
            onClick={handleSave}
            disabled={!url.trim()}
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
}
