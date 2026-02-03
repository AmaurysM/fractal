import { create } from "zustand";
import { Library, Snippet, User } from "../../../types/types";

interface AppState {
  user: User | null;

  libraries: Library[];
  parentLibraries: Library[];
  foundLibraries: Library[];

  snippets: Snippet[];
  parentSnippets: Snippet[];
  foundSnippets: Snippet[];

  loading: boolean;

  isFetchingLibraries: boolean;
  isFetchingParentLibraries: boolean;
  isAddingLibrary: boolean;

  isFetchingSnippets: boolean;
  isFetchingParentSnippets: boolean;
  isAddingSnippet: boolean;

  libraryController?: AbortController;
  snippetController?: AbortController;
  addFolderController?: AbortController;
  addSnippetController?: AbortController;

  isFindingSnippets: boolean;
  isFindingLibraries: boolean;

  selectedSnippet: Snippet | null;
  lastSelectedItem: Snippet | Library | null;

  //////////////

  setUser: (user: User | null) => void;
  fetchLibraries: (userId: string) => Promise<void>;
  fetchSnippets: (userId: string) => Promise<void>;

  addFolder: (
    title: string,
    parentId?: string,
    onSuccess?: () => void,
  ) => Promise<void>;
  cancelAddFolder: () => void;
  deleteFolder: (libraryId: string) => void;
  setIsAddingLibrary: (isAddingLibrary: boolean) => void;
  fetchParentLibraries: (userId: string) => void;

  addSnippet: (
    title: string,
    parentId?: string,
    onSuccess?: () => void,
  ) => Promise<void>;
  cancelAddSnippet: () => void;
  deleteSnippet: (fileId: string) => void;
  setIsAddingSnippet: (isAddingSnippet: boolean) => void;
  fetchParentSnippets: (userId: string) => void;

  saveSnippet: (snippet: Snippet) => void;

  findSnippets: (title: string) => void;
  findLibraries: (title: string) => void;

  handleTreeItemSelect: (item: Library | Snippet) => void;

  setSelectedSnippet: (selectedSnippet: Snippet | null) => void;
  setLastSelectedItem: (lastSelectedItem: Snippet | Library | null) => void;

  // New methods to fetch parent IDs
  getLibraryParentId: (libraryId: string) => Promise<string | null>;
  getSnippetParentId: (snippetId: string) => Promise<string | null>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  libraries: [],
  parentLibraries: [],
  foundLibraries: [],

  snippets: [],
  parentSnippets: [],
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

  setIsAddingLibrary: (isAddingLibrary) => set({ isAddingLibrary }),
  setIsAddingSnippet: (isAddingSnippet) => set({ isAddingSnippet }),

  setSelectedSnippet: (selectedSnippet) => set({ selectedSnippet }),
  setLastSelectedItem: (lastSelectedItem) => set({ lastSelectedItem }),

  setUser: (user) => set({ user }),

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
      set({ libraries: data });
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Fetch libraries cancelled");
      } else {
        console.error("Failed to fetch libraries:", e);
        set({ libraries: [] });
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
      set({ snippets: data });
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Fetch snippets cancelled");
      } else {
        console.error("Failed to fetch snippets:", e);
        set({ snippets: [] });
      }
    } finally {
      set({ isFetchingSnippets: false, snippetController: undefined });
    }
  },

  addFolder: async (title, parentId, onSuccess) => {
    const { user } = get();
    if (!user) return;

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
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Add folder cancelled");
      } else {
        console.error("Error adding folder:", e);
      }
    } finally {
      set({ isAddingLibrary: false, addFolderController: undefined });
      if (onSuccess) onSuccess();
    }
  },

  addSnippet: async (title, parentId, onSuccess) => {
    const { user } = get();
    if (!user) return;

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
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Add snippet cancelled");
      } else {
        console.error("Error adding snippet:", e);
      }
    } finally {
      set({ isAddingSnippet: false, addSnippetController: undefined });
      if (onSuccess) onSuccess();
    }
  },

  cancelAddFolder: () => {
    const controller = get().addFolderController;
    if (controller) {
      controller.abort();
      set({ isAddingLibrary: false, addFolderController: undefined });
      console.log("Add folder job cancelled");
    }
  },

  cancelAddSnippet: () => {
    const controller = get().addSnippetController;
    if (controller) {
      controller.abort();
      set({ isAddingSnippet: false, addSnippetController: undefined });
      console.log("Add snippet job cancelled");
    }
  },

  deleteFolder: async (libraryId: string) => {
    try {
      const res = await fetch(`/api/libraries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete folder");
      }

      // Update state after successful deletion
      set((state) => {
        // Clear selection if deleted library was selected
        const newState: Partial<AppState> = {
          libraries: state.libraries.filter((lib) => lib.id !== libraryId),
          parentLibraries: state.parentLibraries.filter(
            (lib) => lib.id !== libraryId,
          ),
          foundLibraries: state.foundLibraries.filter(
            (lib) => lib.id !== libraryId,
          ),
        };

        // Clear selection if the deleted item was selected
        if (state.lastSelectedItem?.id === libraryId) {
          newState.lastSelectedItem = null;
        }

        return newState;
      });
    } catch (error) {
      console.error("Error deleting library:", error);
      throw error; // Re-throw so TreeItem can handle it
    }
  },

  deleteSnippet: async (fileId: string) => {
    try {
      const res = await fetch(`/api/snippets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete file");
      }

      set((state) => {
        const newState: Partial<AppState> = {
          snippets: state.snippets.filter((snip) => snip.id !== fileId),
          parentSnippets: state.parentSnippets.filter(
            (snip) => snip.id !== fileId,
          ),
          foundSnippets: state.foundSnippets.filter(
            (snip) => snip.id !== fileId,
          ),
        };

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
      throw error;
    }
  },

  saveSnippet: async (updatedSnippet: Snippet) => {
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

      set((state) => ({
        snippets: state.snippets.map((s) =>
          s.id === updatedSnippet.id ? updatedSnippet : s,
        ),
        parentSnippets: state.parentSnippets.map((s) =>
          s.id === updatedSnippet.id ? updatedSnippet : s,
        ),
        selectedSnippet:
          state.selectedSnippet?.id === updatedSnippet.id
            ? updatedSnippet
            : state.selectedSnippet,
      }));
    } catch (error) {
      console.error("Error updating snippet:", error);
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
      set({ parentSnippets: data });
    } catch (error) {
      console.error("Failed to fetch parent files:", error);
      set({ parentSnippets: [] });
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
      set({ parentLibraries: data });
    } catch (error) {
      console.error("Failed to fetch libraries:", error);
      set({ parentLibraries: [] });
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
      set({ selectedSnippet: item });
    }
    set({ lastSelectedItem: item });
    set({ isAddingLibrary: false });
    set({ isAddingSnippet: false });
  },
}));
