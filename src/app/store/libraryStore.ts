import { create } from "zustand";
import { ExplorerItemType } from "../../../types/types";
import { useTabStore } from "./tabStore";

type LibraryStore = {
  selectedItem: string | null;
  setSelectedItem: (item: string | null, type?: ExplorerItemType) => void;

  addingSnippet: boolean;
  setAddingSnippet: (val: boolean) => void;

  addingLibrary: boolean;
  setAddingLibrary: (val: boolean) => void;

  isEditingSnippet: boolean;
  setIsEditingSnippet: (val: boolean) => void;

  isEditingFolder: boolean;
  setIsEditingFolder: (val: boolean) => void;
};

export const useLibraryStore = create<LibraryStore>()((set, get) => ({
  selectedItem: null,
  setSelectedItem: (item: string | null, type?: ExplorerItemType) => {
    const tabStore = useTabStore.getState();
    const state = get();
    if (item && type === ExplorerItemType.File) {
      tabStore.addTab(item);
    }

    if (item && !type) {
      tabStore.selectTab(item);
    }
    const isChangingItem = item !== state.selectedItem;

    set(() => ({
      selectedItem: item,
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
}));
