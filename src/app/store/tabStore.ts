import { create } from "zustand";
import { Snippet } from "../../../types/types";
import { useLibraryStore } from "./libraryStore";

type TabStore = {
  tabs: Snippet[];
  selectedTab: string | null;

  addTab: (snipId: string) => void;
  selectTab: (snipId: string) => void;
  closeTab: (snipId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (snipId: string) => void;
  updateTab: (snippet: Snippet) => void;
};

export const useTabStore = create<TabStore>()((set, get) => ({
  tabs: [],
  selectedTab: null,

  addTab: async (snipId: string) => {
    const state = get();
    const exists = state.tabs.some((t) => t.id === snipId);
    if (exists) {
      set({ selectedTab: snipId });
      return;
    }

    try {
      const res = await fetch(`/api/snippet`, {
        method: "GET",
        headers: { "voronoi-snippet-id": snipId },
      });

      if (!res.ok) return;

      const snippet: Snippet = await res.json();

      set((state) => ({
        tabs: [...state.tabs, snippet],
        selectedTab: snipId,
      }));
    } catch (e) {
      console.error("Failed to add tab:", e);
    }
  },
  selectTab: (snipId: string) => set(() => ({ selectedTab: snipId })),
  closeTab: (snipId: string) => {
    const libraryStore = useLibraryStore.getState();

    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== snipId);

      const nextSelectedTab =
        state.selectedTab === snipId
          ? (newTabs[newTabs.length - 1]?.id ?? null)
          : state.selectedTab;

      libraryStore.setSelectedItem(nextSelectedTab);

      return {
        selectedTab: nextSelectedTab,
        tabs: newTabs,
      };
    });
  },

  closeAllTabs: () => set(() => ({ selectedTab: null, tabs: [] })),
  closeOtherTabs: (snipId: string) =>
    set((state) => {
      const tab = state.tabs.find((t) => t.id === snipId);
      if (!tab) return state;

      return {
        tabs: [tab],
        selectedTab: snipId,
      };
    }),
  updateTab: (snippet: Snippet) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === snippet.id ? snippet : t)),
    })),
  //  setSelectedItem: (item: string) => set(() => ({selectedItem: item, addingSnippet: false, addingLibrary: false})),
}));
