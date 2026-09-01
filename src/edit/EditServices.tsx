import React, { useCallback, ReactNode } from 'react';
import { useServices } from './hooks/useServices';
import { Service, EditHook } from './types';

interface EditServicesRenderProps {
  editData: Service[] | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  save: () => Promise<void>;
  discard: () => void;
  updateService: (index: number, updates: Partial<Service>) => void;
  addService: (service: Service) => void;
  removeService: (index: number) => void;
  updateServiceArrayField: (index: number, field: keyof Service, value: string[]) => void;
}

export default function EditServices({ children }: { children: (props: EditServicesRenderProps) => ReactNode }) {
  const hook = useServices();

  const updateService = useCallback((index: number, updates: Partial<Service>) => {
    hook.updateEditData((draft) => { Object.assign(draft[index], updates); });
  }, [hook.updateEditData]);

  const addService = useCallback((service: Service) => {
    hook.updateEditData((draft) => { draft.push(service); });
  }, [hook.updateEditData]);

  const removeService = useCallback((index: number) => {
    hook.updateEditData((draft) => { draft.splice(index, 1); });
  }, [hook.updateEditData]);

  const updateServiceArrayField = useCallback((index: number, field: keyof Service, value: string[]) => {
    hook.updateEditData((draft) => { (draft[index] as any)[field] = value; });
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
    updateService,
    addService,
    removeService,
    updateServiceArrayField,
  });
}
