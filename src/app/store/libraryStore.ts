import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExplorerItemType } from "../../../types/types";
import { useTabStore } from "./tabStore";

export type DragItem = {
  id: string;
  type: ExplorerItemType;
  title: string;
  parentLibraryId: string | null;
};

type LibraryStore = {
  selectedItem: string | null;
  selectedItemType: ExplorerItemType | null;

  /// array of item <--------

  selectedParentId: string | null;
  setSelectedItem: (item: string | null, type?: ExplorerItemType, parentId?: string | null) => void;

  addingSnippet: boolean;
  setAddingSnippet: (val: boolean) => void;

  addingLibrary: boolean;
  setAddingLibrary: (val: boolean) => void;

  isEditingSnippet: boolean;
  setIsEditingSnippet: (val: boolean) => void;

  isEditingFolder: boolean;
  setIsEditingFolder: (val: boolean) => void;

  dragItem: DragItem | null;
  setDragItem: (item: DragItem | null) => void;

  pendingRemove: string | null;
  setPendingRemove: (id: string | null) => void;
};

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      selectedItem: null,
      selectedItemType: null,
      selectedParentId: null,
      setSelectedItem: (item: string | null, type?: ExplorerItemType, parentId?: string | null) => {
        const tabStore = useTabStore.getState();
        const state = get();
        if (item && type === ExplorerItemType.File) {
          tabStore.addTab(item);
        }
        const isChangingItem = item !== state.selectedItem;

        // If it's a file, parentId is the folder containing it.
        // If it's a folder, it is its own parent context for adding children.
        // If null (root), parentId is null.
        const resolvedParentId =
          type === ExplorerItemType.File
            ? (parentId ?? null)
            : type === ExplorerItemType.Folder
            ? item
            : null;

        set(() => ({
          selectedItemType: type,
          selectedItem: item,
          selectedParentId: resolvedParentId,
          addingSnippet: false,
          addingLibrary: false,
          isEditingFolder: isChangingItem ? false : state.isEditingFolder,
          isEditingSnippet: isChangingItem ? false : state.isEditingSnippet,
        }));
      },

      addingSnippet: false,
      setAddingSnippet: (val: boolean) =>
        set(() => ({ addingSnippet: val, addingLibrary: false })),

      addingLibrary: false,
      setAddingLibrary: (val: boolean) =>
        set(() => ({ addingLibrary: val, addingSnippet: false })),

      isEditingSnippet: false,
      setIsEditingSnippet: (val: boolean) => {
        set(() => ({
          isEditingSnippet: val,
          addingSnippet: false,
          addingLibrary: false,
        }));
      },

      isEditingFolder: false,
      setIsEditingFolder: (val: boolean) => {
        set(() => ({
          isEditingFolder: val,
          addingSnippet: false,
          addingLibrary: false,
        }));
      },

      dragItem: null,
      pendingRemove: null,

      setDragItem: (item) => set(() => ({ dragItem: item })),
      setPendingRemove: (id: string | null) => set({ pendingRemove: id }),
    }),
    {
      name: "library-store",
      partialize: (state) => ({
        selectedItem: state.selectedItem,
      }),
    },
  ),
);