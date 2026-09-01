import { useState, useEffect, useCallback } from 'react';
import { fetchFileFromGitHub, saveFileToGitHub } from '../lib/github';
import { ContactData, EditHook } from '../types';

export function useContact(): EditHook<ContactData> {
  const [originalData, setOriginalData] = useState<ContactData | null>(null);
  const [editData, setEditData] = useState<ContactData | null>(null);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { content, sha } = await fetchFileFromGitHub("src/data/contact.json");
      const parsed = JSON.parse(content) as ContactData;
      setOriginalData(parsed);
      setEditData(structuredClone(parsed));
      setSha(sha);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(editData);

  const save = useCallback(async () => {
    if (!editData) return;
    setSaving(true);
    setError(null);
    try {
      const { newSha } = await saveFileToGitHub(
        "src/data/contact.json",
        JSON.stringify(editData, null, 4),
        sha,
        "Update contact info via edit panel"
      );
      setOriginalData(structuredClone(editData));
      setSha(newSha);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [editData, sha]);

  const discard = useCallback(() => setEditData(structuredClone(originalData)), [originalData]);

  const updateEditData = useCallback((updater: (draft: ContactData) => void) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      updater(draft);
      return draft;
    });
  }, []);

  return { originalData, editData, sha, loading, saving, error, hasChanges, refresh: fetchData, save, discard, updateEditData };
}
