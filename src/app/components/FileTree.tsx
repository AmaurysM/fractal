"use client"

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { TreeSkeleton } from "./SkeletonLoading";
import { TreeItemCreation } from "./TreeItemCreation";
import { ExplorerItemType, Snippet } from "../../../types/types";
import { useLibrary } from "../hooks/useLibrary";
import { useLibraryStore } from "../store/libraryStore";
import { TreeItem } from "./TreeItem";
import { TreeItemEdit } from "./TreeItemEdit";
import { Library } from "../../../types/types";
import { useSnippet } from "../hooks/useSnippet";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { TreeItemDropContainer } from "./TreeItemDropContainer";
import { directionBiased } from "@dnd-kit/collision";
import { ROOT_KEY, useTreeStore } from "../store/treeStore";
import { VscNewFile, VscNewFolder, VscFiles, VscSearch } from "react-icons/vsc";

const RootDropZone = ({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick: () => void;
}) => {
    const { ref, isDropTarget } = useDroppable({
        id: "root",
        collisionDetector: directionBiased,
        data: { id: null, type: ExplorerItemType.Folder },
    });

    return (
        <div
            ref={ref}
            className="flex-1 overflow-auto"
            style={{
                outline: isDropTarget ? "1px solid #007fd4" : undefined,
                borderRadius: isDropTarget ? 2 : undefined,
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

const FileTreeInner = () => {
    const { fetchParentLibraries, moveLibrary } = useLibrary();
    const { fetchParentSnippets, moveSnippet } = useSnippet();

    const {
        selectedItem,
        setSelectedItem,
        addingSnippet,
        addingLibrary,
        isEditingFolder,
        setIsEditingFolder,
        isEditingSnippet,
        setIsEditingSnippet,
        selectedParentId,
        setAddingSnippet,
        setAddingLibrary,
    } = useLibraryStore();

    const { cache, setFolder, moveItem } = useTreeStore();
    const { data: session } = useSession();

    const rootContents = cache[ROOT_KEY];
    const libraries = rootContents?.libs ?? [];
    const snippets = rootContents?.snips ?? [];
    const loading = rootContents === undefined;
    const isSelected = selectedItem == null;

    useEffect(() => {
        if (!session || rootContents !== undefined) return;

        const load = async () => {
            try {
                const [libs, snips] = await Promise.all([
                    fetchParentLibraries(),
                    fetchParentSnippets(),
                ]);
                setFolder(ROOT_KEY, { libs: libs ?? [], snips: snips ?? [] });
            } catch (err) {
                console.error("Failed to fetch tree:", err);
                setFolder(ROOT_KEY, { libs: [], snips: [] });
            }
        };

        load();
    }, [session, rootContents]);

    const refreshFolder = async (folderId: string) => {
        const [libs, snips] = await Promise.all([
            fetchParentLibraries(folderId === ROOT_KEY ? undefined : folderId),
            fetchParentSnippets(folderId === ROOT_KEY ? undefined : folderId),
        ]);
        setFolder(folderId, { libs: libs ?? [], snips: snips ?? [] });
    };

    const handleDragEnd = async (event: any) => {
        if (event.canceled) return;

        const source = event.operation.source?.data as {
            id: string; type: ExplorerItemType; parentId: string | null;
        } | undefined;
        const target = event.operation.target?.data as {
            id: string | null; type: ExplorerItemType;
        } | undefined;

        if (!source || !target) return;
        if (source.id === target.id) return;
        if (target.type !== ExplorerItemType.Folder) return;

        const fromKey = source.parentId ?? ROOT_KEY;
        const toKey = target.id ?? ROOT_KEY;
        if (fromKey === toKey) return;

        // 1. Optimistic update — UI responds instantly
        moveItem(source.id, fromKey, toKey, source.type === ExplorerItemType.Folder);

        // 2. Persist to server
        if (source.type === ExplorerItemType.Folder) {
            await moveLibrary(source.id, target.id ?? null);
        } else {
            await moveSnippet(source.id, target.id ?? null);
        }

        // 3. Reconcile both affected folders with the DB
        await Promise.all([refreshFolder(fromKey), refreshFolder(toKey)]);
    };

    return (
        <>
            <div className="h-8.75 flex items-center justify-between px-3 border-b border-[#3e3e42]">
                <h3 className="text-[11px] font-medium text-[#cccccc] uppercase tracking-wider">Explorer</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            if (selectedParentId !== undefined) {
                                setSelectedItem(selectedParentId, ExplorerItemType.Folder);
                            }
                            setAddingSnippet(true);
                        }} className="p-1.5 rounded-sm hover:bg-[#2a2d2e] transition-colors text-[#cccccc]"
                        title="New File"
                    >
                        <VscNewFile className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            if (selectedParentId !== undefined) {
                                setSelectedItem(selectedParentId, ExplorerItemType.Folder);
                            }
                            setAddingLibrary(true);
                        }} className="p-1.5 rounded-sm hover:bg-[#2a2d2e] transition-colors text-[#cccccc]"
                        title="New Folder"
                    >
                        <VscNewFolder className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <DragDropProvider onDragEnd={handleDragEnd}>
                <RootDropZone onClick={() => setSelectedItem(null)}>
                    {loading ? (
                        <div className="p-2">
                            <TreeSkeleton count={6} />
                        </div>
                    ) : (
                        <>
                            {addingLibrary && isSelected && (
                                <TreeItemCreation
                                    type={ExplorerItemType.Folder}
                                    onSuccess={(newItem) =>
                                        setFolder(ROOT_KEY, {
                                            libs: [...libraries, newItem as any],
                                            snips: snippets,
                                        })
                                    }
                                />
                            )}

                            {libraries.map((lib) => (
                                <div key={lib.id} onClick={(e) => e.stopPropagation()}>
                                    {isEditingFolder && selectedItem === lib.id ? (
                                        <TreeItemEdit
                                            type={ExplorerItemType.Folder}
                                            item={lib}
                                            onSuccess={() => {
                                                // TreeItemEdit mutates item.title in place before calling onSuccess
                                                setIsEditingFolder(false);
                                                setFolder(ROOT_KEY, {
                                                    libs: libraries.map((l) =>
                                                        l.id === lib.id ? { ...l, title: lib.title } : l
                                                    ),
                                                    snips: snippets,
                                                });
                                            }}
                                        />
                                    ) : (
                                        <TreeItemDropContainer dto={lib} type={ExplorerItemType.Folder}>
                                            <TreeItem
                                                item={{ id: lib.id, userid: session?.user.id!, title: lib.title } as Library}
                                                type={ExplorerItemType.Folder}
                                                onDelete={(id) =>
                                                    setFolder(ROOT_KEY, {
                                                        libs: libraries.filter((l) => l.id !== id),
                                                        snips: snippets,
                                                    })
                                                }
                                            />
                                        </TreeItemDropContainer>
                                    )}
                                </div>
                            ))}

                            {addingSnippet && isSelected && (
                                <TreeItemCreation
                                    type={ExplorerItemType.File}
                                    onSuccess={(newItem) =>
                                        setFolder(ROOT_KEY, {
                                            libs: libraries,
                                            snips: [...snippets, newItem as any],
                                        })
                                    }
                                />
                            )}

                            {snippets.map((snip) => (
                                <div key={snip.id} onClick={(e) => e.stopPropagation()}>
                                    {isEditingSnippet && selectedItem === snip.id ? (
                                        <TreeItemEdit
                                            type={ExplorerItemType.File}
                                            item={snip}
                                            onSuccess={() => {
                                                // TreeItemEdit mutates item.title in place before calling onSuccess
                                                setIsEditingSnippet(false);
                                                setFolder(ROOT_KEY, {
                                                    libs: libraries,
                                                    snips: snippets.map((s) =>
                                                        s.id === snip.id ? { ...s, title: snip.title } : s
                                                    ),
                                                });
                                            }}
                                        />
                                    ) : (
                                        <TreeItemDropContainer dto={snip} type={ExplorerItemType.File}>
                                            <TreeItem
                                                item={{ id: snip.id, title: snip.title, userId: session?.user.id! } as Snippet}
                                                type={ExplorerItemType.File}
                                                onDelete={(id) =>
                                                    setFolder(ROOT_KEY, {
                                                        libs: libraries,
                                                        snips: snippets.filter((s) => s.id !== id),
                                                    })
                                                }
                                            />
                                        </TreeItemDropContainer>
                                    )}
                                </div>
                            ))}

                            {libraries.length === 0 && snippets.length === 0 && (
                                <div className="text-center py-12 px-4">
                                    <p className="text-[#858585] text-[13px]">No files or folders</p>
                                    <p className="text-[#6e6e6e] text-[11px] mt-1">Click the icons above to get started</p>
                                </div>
                            )}
                        </>
                    )}
                </RootDropZone>
            </DragDropProvider>
        </>

    );
};

export const FileTree = () => <FileTreeInner />;