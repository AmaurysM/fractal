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
  //clearTabs: () => void;
  isRehydrating: boolean;
  rehydrateTabs: () => Promise<void>;
};

const pickFallback = (tabs: Snippet[]): string | null =>
  tabs[tabs.length - 1]?.id ?? null;

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      selectedTab: null,
      isRehydrating: false,
      rehydrateTabs: async () => {
        const { tabs, selectedTab } = get();

        if (tabs.length === 0) return;

        set({ isRehydrating: true }); // <-- add this

        const tabIds = tabs.map((t) => t.id);
        const results = await Promise.allSettled(
          tabIds.map((id) =>
            fetch(`/api/snippet`, {
              method: "GET",
              headers: { "voronoi-snippet-id": id },
            }).then((res) => {
              if (!res.ok) return null;
              return res.json() as Promise<Snippet>;
            }),
          ),
        );

        const freshTabs: Snippet[] = [];
        for (const result of results) {
          if (result.status === "fulfilled" && result.value) {
            freshTabs.push(result.value);
          }
        }

        const orderedFreshTabs = tabIds
          .map((id) => freshTabs.find((t) => t.id === id))
          .filter((t): t is Snippet => !!t);

        const nextSelected =
          selectedTab && orderedFreshTabs.some((t) => t.id === selectedTab)
            ? selectedTab
            : pickFallback(orderedFreshTabs);

        set({
          tabs: orderedFreshTabs,
          selectedTab: nextSelected,
          isRehydrating: false,
        }); // <-- add flag
      },

      addTab: (snipId: string) => {
        const state = get();

        if (state.tabs.some((t) => t.id === snipId)) {
          set({ selectedTab: snipId });
          return;
        }

        fetch(`/api/snippet`, {
          method: "GET",
          headers: { "voronoi-snippet-id": snipId },
        })
          .then((res) => {
            if (!res.ok) return;
            return res.json();
          })
          .then((snippet: Snippet | undefined) => {
            if (!snippet) return;
            set((s) => ({
              tabs: [...s.tabs, snippet],
              selectedTab: snipId,
            }));
          })
          .catch((e) => console.error("Failed to add tab:", e));
      },

      selectTab: (snipId: string) => set({ selectedTab: snipId }),

      closeTab: (snipId: string) => {
        const libraryStore = useLibraryStore.getState();

        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== snipId);
          const nextSelected =
            state.selectedTab === snipId
              ? pickFallback(newTabs)
              : state.selectedTab;

          libraryStore.setSelectedItem(nextSelected);

          return { tabs: newTabs, selectedTab: nextSelected };
        });
      },

      closeAllTabs: () => {
        useLibraryStore.getState().setSelectedItem(null);
        set({ tabs: [], selectedTab: null });
      },

      closeOtherTabs: (snipId: string) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === snipId);
          if (!tab) return state;
          return { tabs: [tab], selectedTab: snipId };
        }),

      updateTab: (snippet: Snippet) =>
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === snippet.id ? snippet : t)),
        })),

      moveTabToIndex: (snipId: string, index: number) =>
        set((state) => {
          const tabs = [...state.tabs];
          const currentIndex = tabs.findIndex((t) => t.id === snipId);
          if (currentIndex === -1) return state;

          const [moved] = tabs.splice(currentIndex, 1);
          tabs.splice(Math.max(0, Math.min(index, tabs.length)), 0, moved);

          return { tabs };
        }),

      //clearTabs: () => set({ tabs: [], selectedTab: null }),
    }),
    {
      name: "tab-store",
      partialize: (state) => ({
        tabs: state.tabs,
        selectedTab: state.selectedTab,
      }),
    },
  ),
);
