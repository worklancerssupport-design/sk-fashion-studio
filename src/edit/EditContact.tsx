import React, { useCallback, ReactNode } from 'react';
import { useContact } from './hooks/useContact';
import { ContactData } from './types';

interface EditContactRenderProps {
  editData: ContactData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  save: () => Promise<void>;
  discard: () => void;
  updateField: (updates: Partial<ContactData>) => void;
}

export default function EditContact({ children }: { children: (props: EditContactRenderProps) => ReactNode }) {
  const hook = useContact();

  const updateField = useCallback((updates: Partial<ContactData>) => {
    hook.updateEditData((draft) => { Object.assign(draft, updates); });
  }, [hook.updateEditData]);

  return children({
    editData: hook.editData,
    loading: hook.loading,
    saving: hook.saving,
    error: hook.error,
    hasChanges: hook.hasChanges,
    refresh: hook.refresh,
    save: hook.save,
    discard: hook.discard,
    updateField,
  });
}
