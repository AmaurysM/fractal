import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExplorerItemType } from "../../../types/types";
import { getTabStore } from "./tabStore";
import { useSession } from "next-auth/react";

export type DragItem = {
  id: string;
  type: ExplorerItemType;
  title: string;
  parentLibraryId: string | null;
};

type LibraryStore = {
  selectedItem: string | null;
  selectedItemType: ExplorerItemType | null;

  // The folder that newly created items should land in.
  // null  → root
  // <id>  → that folder
  selectedParentId: string | null;

  setSelectedItem: (
    item: string | null,
    type?: ExplorerItemType,
    parentId?: string | null,
  ) => void;

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

      setSelectedItem: (
        item: string | null,
        type?: ExplorerItemType,
        parentId?: string | null,
      ) => {
        // const { data: session } = useSession();
        // const useTabStore = getTabStore(session?.user?.id ?? "guest");
        // const tabStore = useTabStore.getState();
        const state = get();
        const isChangingItem = item !== state.selectedItem;

        // if (item && type === ExplorerItemType.File) {
        //   tabStore.addTab(item);
        // }


        const resolvedParentId =
          type === ExplorerItemType.File
            ? (parentId ?? null) // file's containing folder
            : type === ExplorerItemType.Folder
              ? item // the folder itself
              : null; // root

        set(() => ({
          selectedItem: item,
          selectedItemType: type ?? null,
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
      // When triggering "New Folder/File" from the header buttons WITHOUT an
      // active selection we want creation at root. The header buttons already
      // call setSelectedItem(selectedParentId, ...) before calling
      // setAddingLibrary, so selectedParentId is already correct here.
      setAddingLibrary: (val: boolean) =>
        set(() => ({ addingLibrary: val, addingSnippet: false })),

      isEditingSnippet: false,
      setIsEditingSnippet: (val: boolean) =>
        set(() => ({
          isEditingSnippet: val,
          addingSnippet: false,
          addingLibrary: false,
        })),

      isEditingFolder: false,
      setIsEditingFolder: (val: boolean) =>
        set(() => ({
          isEditingFolder: val,
          addingSnippet: false,
          addingLibrary: false,
        })),

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
