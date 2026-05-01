import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LibraryDTO } from "../api/libraries/parents/route";
import { SnippetDTO } from "../api/snippets/parents/route";

export { inferLanguageFromTitle } from "../../../types/languages";

export const ROOT_KEY = "root";

export const MAX_NAME_LENGTH = 64;
export const INVALID_CHARS = /[/\\:*?"<>|]/;

export function validateItemName(
  name: string,
  siblingNames: string[],
  currentName?: string,
): string | null {
  const trimmed = name.trim();

  if (!trimmed) return "Name cannot be empty.";
  if (trimmed.length > MAX_NAME_LENGTH)
    return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  if (INVALID_CHARS.test(trimmed))
    return `Name cannot contain: / \\ : * ? " < > |`;
  if (trimmed === "." || trimmed === "..")
    return `"${trimmed}" is not a valid name.`;

  const lower = trimmed.toLowerCase();
  const isDuplicate = siblingNames.some(
    (s) => s.toLowerCase() === lower && s !== currentName,
  );
  if (isDuplicate) return `"${trimmed}" already exists in this folder.`;

  return null;
}

export function findParentFolder(cache: Record<string, FolderContents>, snippetId: string) {
  for (const [folderId, contents] of Object.entries(cache)) {
    if (contents.snips.some(s => s.id === snippetId)) {
      return folderId;
    }
  }
  return null;
}

export type FolderContents = {
  libs: LibraryDTO[];
  snips: SnippetDTO[];
};

type TreeStore = {
  cache: Record<string, FolderContents>;
  isRevalidating: boolean;
  expandedFolders: Set<string>;

  setFolder: (folderId: string, contents: FolderContents) => void;
  addItem: (parentFolderId: string, item: LibraryDTO | SnippetDTO, isFolder: boolean) => void;
  removeItem: (parentFolderId: string, itemId: string, isFolder: boolean) => void;
  renameItem: (parentFolderId: string, itemId: string, newTitle: string, isFolder: boolean) => void;
  moveItem: (itemId: string, fromFolderId: string, toFolderId: string, isFolder: boolean) => void;
  invalidate: (folderId: string) => void;
  invalidateAll: () => void;
  setRevalidating: (val: boolean) => void;

  getSiblingNames: (folderId: string, isFolder: boolean, excludeId?: string) => string[];
  isDuplicateName: (folderId: string, name: string, isFolder: boolean, excludeId?: string) => boolean;

  expandFolder: (folderId: string) => void;
  collapseFolder: (folderId: string) => void;
  toggleFolder: (folderId: string) => void;
  isFolderExpanded: (folderId: string) => boolean;
};

export const useTreeStore = create<TreeStore>()(
  persist(
    (set, get) => ({
      cache: {},
      isRevalidating: false,
      expandedFolders: new Set<string>(),

      setFolder(folderId, contents) {
        set((s) => ({ cache: { ...s.cache, [folderId]: contents } }));
      },

      addItem(parentFolderId, item, isFolder) {
        set((s) => {
          const existing = s.cache[parentFolderId];
          if (!existing) return s;
          return {
            cache: {
              ...s.cache,
              [parentFolderId]: {
                libs: isFolder ? [...existing.libs, item as LibraryDTO] : existing.libs,
                snips: isFolder ? existing.snips : [...existing.snips, item as SnippetDTO],
              },
            },
          };
        });
      },

      removeItem(parentFolderId, itemId, isFolder) {
        set((s) => {
          const existing = s.cache[parentFolderId];
          if (!existing) return s;
          return {
            cache: {
              ...s.cache,
              [parentFolderId]: {
                libs: isFolder ? existing.libs.filter((l) => l.id !== itemId) : existing.libs,
                snips: isFolder ? existing.snips : existing.snips.filter((sn) => sn.id !== itemId),
              },
            },
          };
        });
      },

      renameItem(parentFolderId, itemId, newTitle, isFolder) {
        set((s) => {
          const existing = s.cache[parentFolderId];
          if (!existing) return s;
          return {
            cache: {
              ...s.cache,
              [parentFolderId]: {
                libs: isFolder
                  ? existing.libs.map((l) => (l.id === itemId ? { ...l, title: newTitle } : l))
                  : existing.libs,
                snips: isFolder
                  ? existing.snips
                  : existing.snips.map((sn) => (sn.id === itemId ? { ...sn, title: newTitle } : sn)),
              },
            },
          };
        });
      },

      setRevalidating(val) {
        set({ isRevalidating: val });
      },

      getSiblingNames(folderId, isFolder, excludeId) {
        const folder = get().cache[folderId];
        if (!folder) return [];
        const items = isFolder ? folder.libs : folder.snips;
        return items.filter((i) => i.id !== excludeId).map((i) => i.title);
      },

      isDuplicateName(folderId, name, isFolder, excludeId) {
        const names = get().getSiblingNames(folderId, isFolder, excludeId);
        const lower = name.trim().toLowerCase();
        return names.some((n) => n.toLowerCase() === lower);
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
          const newParentId: string | null = toFolderId === ROOT_KEY ? null : toFolderId;

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

      expandFolder(folderId) {
        set((s) => {
          const next = new Set(s.expandedFolders);
          next.add(folderId);
          return { expandedFolders: next };
        });
      },

      collapseFolder(folderId) {
        set((s) => {
          const next = new Set(s.expandedFolders);
          next.delete(folderId);
          return { expandedFolders: next };
        });
      },

      toggleFolder(folderId) {
        set((s) => {
          const next = new Set(s.expandedFolders);
          if (next.has(folderId)) next.delete(folderId);
          else next.add(folderId);
          return { expandedFolders: next };
        });
      },

      isFolderExpanded(folderId) {
        return get().expandedFolders.has(folderId);
      },
    }),
    {
      name: "tree-store",
      partialize: (state) => ({
        cache: state.cache,
        expandedFolders: [...state.expandedFolders],
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).expandedFolders)) {
          state.expandedFolders = new Set((state as any).expandedFolders);
        }
      },
    },
  ),
);