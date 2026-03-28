import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  moveTabToIndex: (snipId: string, index: number) => void;
};

const pickFallback = (tabs: Snippet[]): string | null =>
  tabs[tabs.length - 1]?.id ?? null;

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
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
              ? pickFallback(newTabs)
              : state.selectedTab;

          libraryStore.setSelectedItem(nextSelectedTab);

          return {
            selectedTab: nextSelectedTab,
            tabs: newTabs,
          };
        });
      },

      closeAllTabs: () =>
        set((state) => ({
          tabs: state.tabs,
          selectedTab: pickFallback(state.tabs),
        })),

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

      moveTabToIndex: (snipId: string, index: number) => {
        set((state) => {
          const tabs = [...state.tabs];

          const currentIndex = tabs.findIndex((tab) => tab.id === snipId);
          if (currentIndex === -1) return state;

          const [movedTab] = tabs.splice(currentIndex, 1);

          const newIndex = Math.max(0, Math.min(index, tabs.length));

          tabs.splice(newIndex, 0, movedTab);

          return { tabs };
        });
      },
    }),
    {
      name: "tab-store",
      partialize: (state) => ({
        tabs: state.tabs,
        selectedTab: state.selectedTab,
      }),
    }
  )
);