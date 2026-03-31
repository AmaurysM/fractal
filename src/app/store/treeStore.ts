import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LibraryDTO } from "../api/libraries/parents/route";
import { SnippetDTO } from "../api/snippets/parents/route";

export const ROOT_KEY = "root";

export type FolderContents = {
  libs: LibraryDTO[];
  snips: SnippetDTO[];
};

type TreeStore = {
  cache: Record<string, FolderContents>;
  isRevalidating: boolean;
  setFolder: (folderId: string, contents: FolderContents) => void;
  moveItem: (
    itemId: string,
    fromFolderId: string,
    toFolderId: string,
    isFolder: boolean,
  ) => void;
  invalidate: (folderId: string) => void;
  invalidateAll: () => void;
  setRevalidating: (val: boolean) => void;
};

export const useTreeStore = create<TreeStore>()(
  persist(
    (set) => ({
      cache: {},
      isRevalidating: false,

      setFolder(folderId, contents) {
        set((s) => ({ cache: { ...s.cache, [folderId]: contents } }));
      },

      setRevalidating(val: boolean) {
        set({ isRevalidating: val });
      },

      moveItem(itemId, fromFolderId, toFolderId, isFolder) {
        set((s) => {
          const cache = { ...s.cache };

          const from: FolderContents = cache[fromFolderId]
            ? { ...cache[fromFolderId] }
            : { libs: [], snips: [] };

          const to: FolderContents = cache[toFolderId]
            ? { ...cache[toFolderId] }
            : { libs: [], snips: [] };

          const newParentId: string | null =
            toFolderId === ROOT_KEY ? null : toFolderId;

          if (isFolder) {
            const item = from.libs.find((l) => l.id === itemId);
            if (!item) return s;
            from.libs = from.libs.filter((l) => l.id !== itemId);
            to.libs = [...to.libs, { ...item, parentId: newParentId }];
          } else {
            const item = from.snips.find((sn) => sn.id === itemId);
            if (!item) return s;
            from.snips = from.snips.filter((sn) => sn.id !== itemId);
            to.snips = [...to.snips, { ...item, parentId: newParentId }];
          }

          cache[fromFolderId] = from;
          cache[toFolderId] = to;
          return { cache };
        });
      },

      invalidate(folderId) {
        set((s) => {
          const cache = { ...s.cache };
          delete cache[folderId];
          return { cache };
        });
      },

      invalidateAll() {
        set({ cache: {} });
      },
    }),
    {
      name: "tree-store",
      partialize: (state) => ({ cache: state.cache }),
    },
  ),
);
