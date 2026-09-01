import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import EditLogin from './EditLogin';
import EditDesignsEditor from './EditDesignsEditor';
import EditServicesEditor from './EditServicesEditor';
import EditShopPhotosEditor from './EditShopPhotosEditor';
import EditNav, { EditSection } from './components/EditNav';
import BrandLogo from '../components/BrandLogo';
import { ArrowLeft, LogOut } from 'lucide-react';
import './edit.css';

function EditShell() {
  const { isAuthenticated, logout } = useAuth();
  const [section, setSection] = useState<EditSection>('designs');

  if (!isAuthenticated) return <EditLogin />;

  return (
    <div className="edit-shell">
      <header className="edit-header">
        <div className="edit-header-left">
          <BrandLogo tag="a" href="/" size="sm" color="#151415" className="edit-header-brand" />
          <span className="edit-header-divider" aria-hidden="true" />
          <EditNav selected={section} onSelect={setSection} />
        </div>

        <div className="edit-header-actions">
          <a href="/" className="edit-header-link" title="Back to site" aria-label="Back to site">
            <ArrowLeft size={15} />
          </a>
          <button
            className="edit-header-link"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className="edit-main">
        {section === 'designs' && <EditDesignsEditor />}
        {section === 'services' && <EditServicesEditor />}
        {section === 'shopPhotos' && <EditShopPhotosEditor />}
      </main>
    </div>
  );
}

export default function EditPage() {
  return (
    <AuthProvider>
      <EditShell />
    </AuthProvider>
  );
}
