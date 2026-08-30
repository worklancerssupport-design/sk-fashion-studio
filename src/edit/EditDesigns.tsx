import React, { useCallback, ReactNode } from 'react';
import { useDesigns } from './hooks/useDesigns';
import { DesignsData, DesignCategory } from './types';

interface EditDesignsRenderProps {
  editData: DesignsData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  save: () => Promise<void>;
  discard: () => void;
  updateCategory: (index: number, updates: Partial<DesignCategory>) => void;
  addCategory: (category: DesignCategory) => void;
  removeCategory: (index: number) => void;
  updateNavLabel: (key: string, value: string) => void;
  addNavLabel: (key: string, value: string) => void;
  removeNavLabel: (key: string) => void;
}

export default function EditDesigns({ children }: { children: (props: EditDesignsRenderProps) => ReactNode }) {
  const hook = useDesigns();

  const updateCategory = useCallback((index: number, updates: Partial<DesignCategory>) => {
    hook.updateEditData((draft) => { Object.assign(draft.categories[index], updates); });
  }, [hook.updateEditData]);

  const addCategory = useCallback((category: DesignCategory) => {
    hook.updateEditData((draft) => { draft.categories.push(category); });
  }, [hook.updateEditData]);

  const removeCategory = useCallback((index: number) => {
    hook.updateEditData((draft) => { draft.categories.splice(index, 1); });
  }, [hook.updateEditData]);

  const updateNavLabel = useCallback((key: string, value: string) => {
    hook.updateEditData((draft) => { draft.navLabels[key] = value; });
  }, [hook.updateEditData]);

  const addNavLabel = useCallback((key: string, value: string) => {
    hook.updateEditData((draft) => { draft.navLabels[key] = value; });
  }, [hook.updateEditData]);

  const removeNavLabel = useCallback((key: string) => {
    hook.updateEditData((draft) => { delete draft.navLabels[key]; });
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
    updateCategory,
    addCategory,
    removeCategory,
    updateNavLabel,
    addNavLabel,
    removeNavLabel,
  });
}
