/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Library, Snippet, User } from "../../../types/types";

interface AppState {
  user: User | null;

  // UI State (local, optimistic)
  uiLibraries: Library[];
  uiParentLibraries: Library[];
  uiSnippets: Snippet[];
  uiParentSnippets: Snippet[];

  // DB State (source of truth, updated after server responses)
  dbLibraries: Library[];
  dbParentLibraries: Library[];
  dbSnippets: Snippet[];
  dbParentSnippets: Snippet[];

  // Search results (always fresh from server)
  foundLibraries: Library[];
  foundSnippets: Snippet[];

  // Loading states
  loading: boolean;
  isFetchingLibraries: boolean;
  isFetchingParentLibraries: boolean;
  isAddingLibrary: boolean;
  isFetchingSnippets: boolean;
  isFetchingParentSnippets: boolean;
  isAddingSnippet: boolean;
  isFindingSnippets: boolean;
  isFindingLibraries: boolean;

  // Abort controllers
  libraryController?: AbortController;
  snippetController?: AbortController;
  addFolderController?: AbortController;
  addSnippetController?: AbortController;

  // Selection state
  selectedSnippet: Snippet | null;
  lastSelectedItem: Snippet | Library | null;

  // Tab management
  openTabs: Snippet[];
  activeTabId: string | null;

  // Hydration flag
  isHydrated: boolean;

  //////////////
  // Actions
  //////////////

  setUser: (user: User | null) => void;
  setIsHydrated: (isHydrated: boolean) => void;

  // Library actions
  fetchLibraries: (userId: string) => Promise<void>;
  fetchParentLibraries: (userId: string) => Promise<void>;
  addFolder: (
    title: string,
    parentId?: string,
    onSuccess?: () => void,
  ) => Promise<void>;
  deleteFolder: (libraryId: string) => Promise<void>;
  setIsAddingLibrary: (isAddingLibrary: boolean) => void;
  cancelAddFolder: () => void;

  // Snippet actions
  fetchSnippets: (userId: string) => Promise<void>;
  fetchParentSnippets: (userId: string) => Promise<void>;
  addSnippet: (
    title: string,
    parentId?: string,
    onSuccess?: () => void,
  ) => Promise<void>;
  deleteSnippet: (fileId: string) => Promise<void>;
  saveSnippet: (snippet: Snippet) => Promise<void>;
  setIsAddingSnippet: (isAddingSnippet: boolean) => void;
  cancelAddSnippet: () => void;

  // Search actions
  findSnippets: (title: string) => Promise<void>;
  findLibraries: (title: string) => Promise<void>;

  // Selection actions
  handleTreeItemSelect: (item: Library | Snippet) => void;
  setSelectedSnippet: (selectedSnippet: Snippet | null) => void;
  setLastSelectedItem: (lastSelectedItem: Snippet | Library | null) => void;

  // Tab management methods
  openTab: (snippet: Snippet) => void;
  closeTab: (snippetId: string) => void;
  setActiveTab: (snippetId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (snippetId: string) => void;

  // Utility methods
  getLibraryParentId: (libraryId: string) => Promise<string | null>;
  getSnippetParentId: (snippetId: string) => Promise<string | null>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      
      // UI State
      uiLibraries: [],
      uiParentLibraries: [],
      uiSnippets: [],
      uiParentSnippets: [],

      // DB State
      dbLibraries: [],
      dbParentLibraries: [],
      dbSnippets: [],
      dbParentSnippets: [],

      foundLibraries: [],
      foundSnippets: [],

      loading: false,
      isFetchingLibraries: false,
      isFetchingParentLibraries: false,
      isAddingLibrary: false,
      isFetchingSnippets: false,
      isFetchingParentSnippets: false,
      isAddingSnippet: false,
      isFindingLibraries: false,
      isFindingSnippets: false,

      selectedSnippet: null,
      lastSelectedItem: null,

      openTabs: [],
      activeTabId: null,

      isHydrated: false,

      setIsHydrated: (isHydrated) => set({ isHydrated }),
      setIsAddingLibrary: (isAddingLibrary) => set({ isAddingLibrary }),
      setIsAddingSnippet: (isAddingSnippet) => set({ isAddingSnippet }),
      setSelectedSnippet: (selectedSnippet) => set({ selectedSnippet }),
      setLastSelectedItem: (lastSelectedItem) => set({ lastSelectedItem }),
      setUser: (user) => {
        const currentUser = get().user;
        
        // If user changed, clear tabs and selections
        if (currentUser && user && currentUser.id !== user.id) {
          set({
            user,
            openTabs: [],
            activeTabId: null,
            selectedSnippet: null,
            lastSelectedItem: null,
          });
        } else {
          set({ user });
        }
      },

      // Tab management methods
      openTab: (snippet: Snippet) => {
        const { openTabs, uiSnippets, uiParentSnippets } = get();
        
        // Get the latest version of the snippet from the store
        const latestSnippet = uiSnippets.find(s => s.id === snippet.id) || 
                              uiParentSnippets.find(s => s.id === snippet.id) || 
                              snippet;
        
        const existingTabIndex = openTabs.findIndex((tab) => tab.id === latestSnippet.id);

        if (existingTabIndex !== -1) {
          // Update the existing tab with latest data
          const updatedTabs = [...openTabs];
          updatedTabs[existingTabIndex] = latestSnippet;
          
          set({
            openTabs: updatedTabs,
            activeTabId: latestSnippet.id,
            selectedSnippet: latestSnippet,
          });
        } else {
          set({
            openTabs: [...openTabs, latestSnippet],
            activeTabId: latestSnippet.id,
            selectedSnippet: latestSnippet,
          });
        }
      },

      closeTab: (snippetId: string) => {
        const { openTabs, activeTabId } = get();
        const tabIndex = openTabs.findIndex((tab) => tab.id === snippetId);

        if (tabIndex === -1) return;

        const newTabs = openTabs.filter((tab) => tab.id !== snippetId);

        if (activeTabId === snippetId) {
          if (newTabs.length === 0) {
            set({
              openTabs: newTabs,
              activeTabId: null,
              selectedSnippet: null,
            });
          } else {
            const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
            const newActiveTab = newTabs[newActiveIndex];
            set({
              openTabs: newTabs,
              activeTabId: newActiveTab.id,
              selectedSnippet: newActiveTab,
            });
          }
        } else {
          set({ openTabs: newTabs });
        }
      },

      setActiveTab: (snippetId: string) => {
        const { openTabs, uiSnippets, uiParentSnippets } = get();
        const tab = openTabs.find((t) => t.id === snippetId);

        if (tab) {
          // Get the latest version from the store
          const latestSnippet = uiSnippets.find(s => s.id === snippetId) || 
                                uiParentSnippets.find(s => s.id === snippetId) || 
                                tab;
          
          // Update the tab with latest data
          const updatedTabs = openTabs.map(t => 
            t.id === snippetId ? latestSnippet : t
          );
          
          set({
            openTabs: updatedTabs,
            activeTabId: snippetId,
            selectedSnippet: latestSnippet,
          });
        }
      },

      closeAllTabs: () => {
        set({
          openTabs: [],
          activeTabId: null,
          selectedSnippet: null,
        });
      },

      closeOtherTabs: (snippetId: string) => {
        const { openTabs, uiSnippets, uiParentSnippets } = get();
        const keepTab = openTabs.find((tab) => tab.id === snippetId);

        if (keepTab) {
          // Get latest version
          const latestSnippet = uiSnippets.find(s => s.id === snippetId) || 
                                uiParentSnippets.find(s => s.id === snippetId) || 
                                keepTab;
          
          set({
            openTabs: [latestSnippet],
            activeTabId: snippetId,
            selectedSnippet: latestSnippet,
          });
        }
      },

      getLibraryParentId: async (libraryId: string) => {
        try {
          const res = await fetch(`/api/libraries/parent`, {
            method: "GET",
            headers: { "x-library-id": libraryId },
          });

          if (!res.ok) throw new Error("Failed to fetch parent library");

          const data = await res.json();
          return data.parentId;
        } catch (error) {
          console.error("Error fetching library parent:", error);
          return null;
        }
      },

      getSnippetParentId: async (snippetId: string) => {
        try {
          const res = await fetch(`/api/snippets/parent`, {
            method: "GET",
            headers: { "x-snippet-id": snippetId },
          });

          if (!res.ok) throw new Error("Failed to fetch snippet parent");

          const data = await res.json();
          return data.parentId;
        } catch (error) {
          console.error("Error fetching snippet parent:", error);
          return null;
        }
      },

      fetchLibraries: async (userId) => {
        const prevController = get().libraryController;
        if (prevController) prevController.abort();

        const controller = new AbortController();
        set({ libraryController: controller, isFetchingLibraries: true });

        try {
          const res = await fetch(`/api/libraries`, {
            method: "GET",
            headers: { "x-user-id": userId },
            signal: controller.signal,
          });

          if (!res.ok) throw new Error("Failed to fetch libraries");

          const data: Library[] = await res.json();
          
          // Update both DB state and UI state
          set({ 
            dbLibraries: data,
            uiLibraries: data 
          });
        } catch (e: any) {
          if (e.name === "AbortError") {
            console.log("Fetch libraries cancelled");
          } else {
            console.error("Failed to fetch libraries:", e);
          }
        } finally {
          set({ isFetchingLibraries: false, libraryController: undefined });
        }
      },

      fetchSnippets: async (userId) => {
        const prevController = get().snippetController;
        if (prevController) prevController.abort();

        const controller = new AbortController();
        set({ snippetController: controller, isFetchingSnippets: true });

        try {
          const res = await fetch(`/api/snippets`, {
            method: "GET",
            headers: { "x-user-id": userId },
            signal: controller.signal,
          });

          if (!res.ok) throw new Error("Failed to fetch snippets");

          const data: Snippet[] = await res.json();
          
          // Update both DB state and UI state
          set({ 
            dbSnippets: data,
            uiSnippets: data 
          });
        } catch (e: any) {
          if (e.name === "AbortError") {
            console.log("Fetch snippets cancelled");
          } else {
            console.error("Failed to fetch snippets:", e);
          }
        } finally {
          set({ isFetchingSnippets: false, snippetController: undefined });
        }
      },

      addFolder: async (title, parentId, onSuccess) => {
        const { user } = get();
        if (!user) return;

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticLibrary: Library = {
          id: tempId,
          userid: user.id,
          title,
        };

        set((state) => ({
          uiLibraries: [...state.uiLibraries, optimisticLibrary],
          uiParentLibraries: parentId 
            ? state.uiParentLibraries 
            : [...state.uiParentLibraries, optimisticLibrary],
        }));

        const prevController = get().addFolderController;
        if (prevController) prevController.abort();

        const controller = new AbortController();
        set({ addFolderController: controller, isAddingLibrary: true });

        try {
          const res = await fetch(`/api/libraries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              userId: user.id,
              parentId,
              title,
            }),
          });

          if (!res.ok) throw new Error("Failed to add folder");

          const newLibrary: Library = await res.json();

          // Replace optimistic item with real data
          set((state) => ({
            uiLibraries: state.uiLibraries.map(lib => 
              lib.id === tempId ? newLibrary : lib
            ),
            uiParentLibraries: state.uiParentLibraries.map(lib => 
              lib.id === tempId ? newLibrary : lib
            ),
            dbLibraries: [...state.dbLibraries, newLibrary],
            dbParentLibraries: parentId 
              ? state.dbParentLibraries 
              : [...state.dbParentLibraries, newLibrary],
          }));

          if (onSuccess) onSuccess();
        } catch (e: any) {
          if (e.name === "AbortError") {
            console.log("Add folder cancelled");
          } else {
            console.error("Error adding folder:", e);
            
            // Rollback optimistic update on error
            set((state) => ({
              uiLibraries: state.uiLibraries.filter(lib => lib.id !== tempId),
              uiParentLibraries: state.uiParentLibraries.filter(lib => lib.id !== tempId),
            }));
          }
        } finally {
          set({ isAddingLibrary: false, addFolderController: undefined });
        }
      },

      addSnippet: async (title, parentId, onSuccess) => {
        const { user } = get();
        if (!user) return;

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticSnippet: Snippet = {
          id: tempId,
          userId: user.id,
          title,
          text: "",
        };

        set((state) => ({
          uiSnippets: [...state.uiSnippets, optimisticSnippet],
          uiParentSnippets: parentId 
            ? state.uiParentSnippets 
            : [...state.uiParentSnippets, optimisticSnippet],
        }));

        const prevController = get().addSnippetController;
        if (prevController) prevController.abort();

        const controller = new AbortController();
        set({ addSnippetController: controller, isAddingSnippet: true });

        try {
          const res = await fetch(`/api/snippets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              title,
              parentId,
            }),
          });

          if (!res.ok) throw new Error("Failed to add snippet");

          const newSnippet: Snippet = await res.json();

          // Replace optimistic item with real data
          set((state) => ({
            uiSnippets: state.uiSnippets.map(snip => 
              snip.id === tempId ? newSnippet : snip
            ),
            uiParentSnippets: state.uiParentSnippets.map(snip => 
              snip.id === tempId ? newSnippet : snip
            ),
            dbSnippets: [...state.dbSnippets, newSnippet],
            dbParentSnippets: parentId 
              ? state.dbParentSnippets 
              : [...state.dbParentSnippets, newSnippet],
          }));

          if (onSuccess) onSuccess();
        } catch (e: any) {
          if (e.name === "AbortError") {
            console.log("Add snippet cancelled");
          } else {
            console.error("Error adding snippet:", e);
            
            // Rollback optimistic update on error
            set((state) => ({
              uiSnippets: state.uiSnippets.filter(snip => snip.id !== tempId),
              uiParentSnippets: state.uiParentSnippets.filter(snip => snip.id !== tempId),
            }));
          }
        } finally {
          set({ isAddingSnippet: false, addSnippetController: undefined });
        }
      },

      cancelAddFolder: () => {
        const controller = get().addFolderController;
        if (controller) {
          controller.abort();
          set({ isAddingLibrary: false, addFolderController: undefined });
        }
      },

      cancelAddSnippet: () => {
        const controller = get().addSnippetController;
        if (controller) {
          controller.abort();
          set({ isAddingSnippet: false, addSnippetController: undefined });
        }
      },

      deleteFolder: async (libraryId: string) => {
        // Optimistic UI update
        set((state) => ({
          uiLibraries: state.uiLibraries.filter((lib) => lib.id !== libraryId),
          uiParentLibraries: state.uiParentLibraries.filter(
            (lib) => lib.id !== libraryId,
          ),
        }));

        try {
          const res = await fetch(`/api/libraries`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ libraryId }),
          });

          if (!res.ok) {
            throw new Error("Failed to delete folder");
          }

          // Update DB state and clear selections
          set((state) => {
            const newState: Partial<AppState> = {
              dbLibraries: state.dbLibraries.filter((lib) => lib.id !== libraryId),
              dbParentLibraries: state.dbParentLibraries.filter(
                (lib) => lib.id !== libraryId,
              ),
              foundLibraries: state.foundLibraries.filter(
                (lib) => lib.id !== libraryId,
              ),
            };

            if (state.lastSelectedItem?.id === libraryId) {
              newState.lastSelectedItem = null;
            }

            return newState;
          });
        } catch (error) {
          console.error("Error deleting library:", error);
          
          // Rollback on error - restore from DB state
          set((state) => ({
            uiLibraries: [...state.dbLibraries],
            uiParentLibraries: [...state.dbParentLibraries],
          }));
          
          throw error;
        }
      },

      deleteSnippet: async (fileId: string) => {
        // Optimistic UI update
        set((state) => ({
          uiSnippets: state.uiSnippets.filter((snip) => snip.id !== fileId),
          uiParentSnippets: state.uiParentSnippets.filter(
            (snip) => snip.id !== fileId,
          ),
        }));

        try {
          const res = await fetch(`/api/snippets`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          });

          if (!res.ok) {
            throw new Error("Failed to delete file");
          }

          // Update DB state and manage tabs
          set((state) => {
            const newState: Partial<AppState> = {
              dbSnippets: state.dbSnippets.filter((snip) => snip.id !== fileId),
              dbParentSnippets: state.dbParentSnippets.filter(
                (snip) => snip.id !== fileId,
              ),
              foundSnippets: state.foundSnippets.filter(
                (snip) => snip.id !== fileId,
              ),
            };

            const newTabs = state.openTabs.filter((tab) => tab.id !== fileId);
            newState.openTabs = newTabs;

            if (state.activeTabId === fileId) {
              if (newTabs.length === 0) {
                newState.activeTabId = null;
                newState.selectedSnippet = null;
              } else {
                const newActiveTab = newTabs[0];
                newState.activeTabId = newActiveTab.id;
                newState.selectedSnippet = newActiveTab;
              }
            }

            if (state.selectedSnippet?.id === fileId) {
              newState.selectedSnippet = null;
            }
            if (state.lastSelectedItem?.id === fileId) {
              newState.lastSelectedItem = null;
            }

            return newState;
          });
        } catch (error) {
          console.error("Error deleting file:", error);
          
          // Rollback on error
          set((state) => ({
            uiSnippets: [...state.dbSnippets],
            uiParentSnippets: [...state.dbParentSnippets],
          }));
          
          throw error;
        }
      },

      saveSnippet: async (updatedSnippet: Snippet) => {
        // Optimistic UI update - update all references
        set((state) => ({
          uiSnippets: state.uiSnippets.map((s) =>
            s.id === updatedSnippet.id ? updatedSnippet : s,
          ),
          uiParentSnippets: state.uiParentSnippets.map((s) =>
            s.id === updatedSnippet.id ? updatedSnippet : s,
          ),
          selectedSnippet:
            state.selectedSnippet?.id === updatedSnippet.id
              ? updatedSnippet
              : state.selectedSnippet,
          openTabs: state.openTabs.map((tab) =>
            tab.id === updatedSnippet.id ? updatedSnippet : tab,
          ),
          foundSnippets: state.foundSnippets.map((s) =>
            s.id === updatedSnippet.id ? updatedSnippet : s,
          ),
        }));

        try {
          const res = await fetch(`/api/snippets`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: updatedSnippet.id,
              userId: updatedSnippet.userId,
              title: updatedSnippet.title,
              description: updatedSnippet.description,
              language: updatedSnippet.language,
              text: updatedSnippet.text,
            }),
          });

          if (!res.ok) throw new Error("Failed to update snippet");

          // Update DB state
          set((state) => ({
            dbSnippets: state.dbSnippets.map((s) =>
              s.id === updatedSnippet.id ? updatedSnippet : s,
            ),
            dbParentSnippets: state.dbParentSnippets.map((s) =>
              s.id === updatedSnippet.id ? updatedSnippet : s,
            ),
          }));
        } catch (error) {
          console.error("Error updating snippet:", error);
          
          // Rollback on error
          set((state) => ({
            uiSnippets: [...state.dbSnippets],
            uiParentSnippets: [...state.dbParentSnippets],
          }));
        }
      },

      fetchParentSnippets: async (userId: string) => {
        set({ isFetchingParentSnippets: true });
        try {
          const res = await fetch(`/api/snippets/parents`, {
            method: "GET",
            headers: {
              "x-user-id": userId,
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch parent snippets");
          }

          const data: Snippet[] = await res.json();
          set({ 
            dbParentSnippets: data,
            uiParentSnippets: data 
          });
        } catch (error) {
          console.error("Failed to fetch parent files:", error);
        } finally {
          set({ isFetchingParentSnippets: false });
        }
      },

      fetchParentLibraries: async (userId: string) => {
        set({ isFetchingParentLibraries: true });
        try {
          const res = await fetch(`/api/libraries/parents`, {
            method: "GET",
            headers: {
              "x-user-id": userId,
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch libraries");
          }

          const data: Library[] = await res.json();
          set({ 
            dbParentLibraries: data,
            uiParentLibraries: data 
          });
        } catch (error) {
          console.error("Failed to fetch libraries:", error);
        } finally {
          set({ isFetchingParentLibraries: false });
        }
      },

      findSnippets: async (title: string) => {
        if (!title) {
          set({ foundSnippets: [] });
          return;
        }

        set({ isFindingSnippets: true });

        try {
          const res = await fetch(
            `/api/snippets/search?fileTitle=${encodeURIComponent(title)}`,
          );
          if (!res.ok) throw new Error("Failed to find Snippets/files");
          const data: Snippet[] = await res.json();
          set({ foundSnippets: data });
        } catch (error) {
          console.error("Error finding snippets:", error);
          set({ foundSnippets: [] });
        } finally {
          set({ isFindingSnippets: false });
        }
      },

      findLibraries: async (title: string) => {
        if (!title) {
          set({ foundLibraries: [] });
          return;
        }

        set({ isFindingLibraries: true });

        try {
          const res = await fetch(
            `/api/libraries/search?folderTitle=${encodeURIComponent(title)}`,
          );
          if (!res.ok) throw new Error("Failed to find libraries");

          const data: Library[] = await res.json();
          set({ foundLibraries: data });
        } catch (error) {
          console.error("Error finding libraries:", error);
          set({ foundLibraries: [] });
        } finally {
          set({ isFindingLibraries: false });
        }
      },

      handleTreeItemSelect: (item: Library | Snippet) => {
        if ("text" in item) {
          get().openTab(item);
        }
        set({ lastSelectedItem: item });
        set({ isAddingLibrary: false });
        set({ isAddingSnippet: false });
      },
    }),
    {
      name: "fractal-storage",
      partialize: (state) => ({
        // Persist user ID to detect user changes
        userId: state.user?.id,
        // Only persist UI state and tabs
        uiLibraries: state.uiLibraries,
        uiParentLibraries: state.uiParentLibraries,
        uiSnippets: state.uiSnippets,
        uiParentSnippets: state.uiParentSnippets,
        openTabs: state.openTabs,
        activeTabId: state.activeTabId,
        selectedSnippet: state.selectedSnippet,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);