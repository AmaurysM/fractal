"use client";

import { useCallback } from "react";
import { useSettingsStore } from "../store/SettingsStore";
import { AppSettings, EditorSettings, UserSettings } from "../../../types/types";

async function apiFetchSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function apiSaveUserSettings(
  patch: Partial<Omit<UserSettings, "id" | "email" | "image">>
): Promise<void> {
  await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table: "user", patch }),
  });
}

async function apiSaveEditorSettings(
  patch: Partial<Omit<EditorSettings, "id">>
): Promise<void> {
  await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table: "editor", patch }),
  });
}

export function useSettings() {
  const {
    settings,
    status,
    error,
    setSettings,
    setStatus,
    setError,
    patchUserSettings,
    patchEditorSettings,
  } = useSettingsStore();

  const fetchSettings = useCallback(async () => {
    if (settings !== null) return;

    setStatus("loading");
    try {
      const data = await apiFetchSettings();
      setSettings(data);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [settings, setSettings, setStatus, setError]);

  const updateUserSettings = useCallback(
    async (patch: Partial<Omit<UserSettings, "id" | "email" | "image">>) => {
      const updated = patchUserSettings(patch);
      if (!updated) return;

      setStatus("saving");
      try {
        await apiSaveUserSettings(patch);
        setStatus("saved");
      } catch (err) {
        setSettings(updated);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    [patchUserSettings, setSettings, setStatus, setError]
  );

  const updateEditorSettings = useCallback(
    async (patch: Partial<Omit<EditorSettings, "id">>) => {
      const updated = patchEditorSettings(patch);
      if (!updated) return;

      setStatus("saving");
      try {
        await apiSaveEditorSettings(patch);
        setStatus("saved");
      } catch (err) {
        setSettings(updated);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    [patchEditorSettings, setSettings, setStatus, setError]
  );

  const resetEditorSettings = useCallback(async () => {
  }, []);

  return {
    settings,
    status,
    error,
    fetchSettings,
    updateUserSettings,
    updateEditorSettings,
    resetEditorSettings,
  };
}