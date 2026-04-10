// store/SettingsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppSettings, UserSettings, EditorSettings } from "../../../types/types";

export type SettingsStatus = "idle" | "loading" | "saving" | "error" | "saved";

export type SettingsStore = {
  settings: AppSettings | null;
  status: SettingsStatus;
  error: string | null;
  flashedSetting: string | null;
  setFlashedSetting: (key: string | null) => void;

  setSettings: (settings: AppSettings) => void;
  setStatus: (status: SettingsStatus) => void;
  setError: (error: string | null) => void;

  patchUserSettings: (
    patch: Partial<Omit<UserSettings, "id" | "email" | "image">>
  ) => AppSettings | null;
  patchEditorSettings: (
    patch: Partial<Omit<EditorSettings, "id">>
  ) => AppSettings | null;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      status: "idle",
      error: null,
      flashedSetting: null,

      setFlashedSetting: (key) => set({ flashedSetting: key }),
      setSettings: (settings) => set({ settings }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),

      patchUserSettings: (patch) => {
        const { settings } = get();
        if (!settings) return null;
        const updated: AppSettings = {
          ...settings,
          user: { ...settings.user, ...patch },
        };
        set({ settings: updated });
        return updated;
      },

      patchEditorSettings: (patch) => {
        const { settings } = get();
        if (!settings) return null;
        const updated: AppSettings = {
          ...settings,
          editor: { ...settings.editor, ...patch },
        };
        set({ settings: updated });
        return updated;
      },
    }),
    {
      name: "voronoi-settings",
      storage: createJSONStorage(() => localStorage),
      // Only persist the settings data — status, errors, and the transient
      // flash state are always reset fresh on page load.
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);