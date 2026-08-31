import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import EditLogin from './EditLogin';
import EditDesignsEditor from './EditDesignsEditor';
import BrandLogo from '../components/BrandLogo';
import { ArrowLeft, LogOut } from 'lucide-react';
import './edit.css';

function EditShell() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <EditLogin />;

  return (
    <div className="edit-shell">
      <header className="edit-header">
        <BrandLogo tag="a" href="/" size="sm" color="#151415" className="edit-header-brand" />

        <div className="edit-header-actions">
          <a href="/" className="edit-header-link">
            <ArrowLeft size={14} />
            <span>Back to Site</span>
          </a>
          <button className="edit-header-btn" onClick={logout}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="edit-main">
        <EditDesignsEditor />
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
