import React, { useCallback, ReactNode } from 'react';
import { useShopPhotos } from './hooks/useShopPhotos';
import { ShopPhoto, EditHook } from './types';

interface EditShopPhotosRenderProps {
  editData: ShopPhoto[] | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  save: () => Promise<void>;
  discard: () => void;
  updatePhoto: (index: number, updates: Partial<ShopPhoto>) => void;
  addPhoto: (photo: ShopPhoto) => void;
  removePhoto: (index: number) => void;
}

export default function EditShopPhotos({ children }: { children: (props: EditShopPhotosRenderProps) => ReactNode }) {
  const hook = useShopPhotos();

  const updatePhoto = useCallback((index: number, updates: Partial<ShopPhoto>) => {
    hook.updateEditData((draft) => { Object.assign(draft[index], updates); });
  }, [hook.updateEditData]);

  const addPhoto = useCallback((photo: ShopPhoto) => {
    hook.updateEditData((draft) => { draft.push(photo); });
  }, [hook.updateEditData]);

  const removePhoto = useCallback((index: number) => {
    hook.updateEditData((draft) => { draft.splice(index, 1); });
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
    updatePhoto,
    addPhoto,
    removePhoto,
  });
}
