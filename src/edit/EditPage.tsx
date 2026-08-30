import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import EditLogin from './EditLogin';
import EditDesignsEditor from './EditDesignsEditor';
import { ArrowLeft, LogOut, Layers } from 'lucide-react';
import './edit.css';

function EditShell() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <EditLogin />;

  return (
    <div className="edit-shell">
      <header className="edit-header">
        <div className="edit-header-left">
          <Layers size={22} />
          <h1>Edit Console</h1>
        </div>
        <div className="edit-header-right">
          <a href="/" className="edit-header-btn">
            <ArrowLeft size={16} />
            <span>Back to Site</span>
          </a>
          <button className="edit-header-btn edit-header-btn--logout" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
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
