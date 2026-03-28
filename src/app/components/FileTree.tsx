"use client"

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { TreeSkeleton } from "./SkeletonLoading";
import { TreeItemCreation } from "./TreeItemCreation";
import { ExplorerItemType, Snippet } from "../../../types/types";
import { useLibrary } from "../hooks/useLibrary";
import { useLibraryStore } from "../store/libraryStore";
import { TreeItem } from "./TreeItem";
import { TreeItemEdit } from "./TreeItemEdit";
import { Library } from "../../../types/types";
import { LibraryDTO } from "../api/libraries/parents/route";
import { useSnippet } from "../hooks/useSnippet";
import { SnippetDTO } from "../api/snippets/parents/route";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { TreeItemDropContainer } from "./TreeItemDropContainer";
import { directionBiased } from "@dnd-kit/collision";

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

export const FileTree = () => {
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
    } = useLibraryStore();

    const { data: session } = useSession();
    const [libraries, setLibraries] = useState<LibraryDTO[]>([]);
    const [snippets, setSnippets] = useState<SnippetDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const isSelected = selectedItem == null;

    useEffect(() => {
        if (!session) return;

        const load = async () => {
            setLoading(true);
            try {
                const [libs, snips] = await Promise.all([
                    fetchParentLibraries(),
                    fetchParentSnippets(),
                ]);
                if (libs) setLibraries(libs);
                if (snips) setSnippets(snips);
            } catch (error) {
                console.error("Failed to fetch tree:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [session]);
    const refreshRoot = async () => {
        const [libs, snips] = await Promise.all([
            fetchParentLibraries(),
            fetchParentSnippets(),
        ]);
        if (libs) setLibraries(libs);
        if (snips) setSnippets(snips);
    };

    // FileTree.tsx
    const handleDragEnd = async (event: any) => {
        if (event.canceled) return;

        const source = event.operation.source?.data;
        const target = event.operation.target?.data;

        if (!source || !target) return;
        if (source.id === target.id) return;
        if (target.type !== ExplorerItemType.Folder) return;

        const targetFolderId: string | null = target.id ?? null;

        if (source.type === ExplorerItemType.Folder) {
            await moveLibrary(source.id, targetFolderId);
        } else {
            await moveSnippet(source.id, targetFolderId);
        }

        const sourceWasAtRoot = !source.parentId;
        const targetIsRoot = targetFolderId === null;

        if (sourceWasAtRoot || targetIsRoot) {
            await refreshRoot();
        }

        window.dispatchEvent(new CustomEvent("tree:refresh", {
            detail: {
                folderIds: [source.parentId, targetFolderId].filter(Boolean)
            }
        }));
    };

    return (
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
                                onSuccess={() => fetchParentLibraries()}
                            />
                        )}

                        {libraries.map((lib) => (
                            <div key={lib.id} onClick={(e) => e.stopPropagation()}>
                                {isEditingFolder && selectedItem === lib.id ? (
                                    <TreeItemEdit
                                        type={ExplorerItemType.Folder}
                                        item={lib}
                                        onSuccess={() => {
                                            setIsEditingFolder(false);
                                            setLibraries(prev =>
                                                prev.map(l =>
                                                    l.id === lib.id ? { ...l, title: lib.title } : l
                                                )
                                            );
                                        }}
                                    />
                                ) : (
                                    // Wrap root-level folders so they register as draggable sources
                                    <TreeItemDropContainer dto={lib} type={ExplorerItemType.Folder}>
                                        <TreeItem
                                            item={{ id: lib.id, userid: session?.user.id!, title: lib.title } as Library}
                                            type={ExplorerItemType.Folder}
                                            onDelete={(id) => setLibraries(prev => prev.filter(l => l.id !== id))}
                                        />
                                    </TreeItemDropContainer>
                                )}
                            </div>
                        ))}

                        {addingSnippet && isSelected && (
                            <TreeItemCreation
                                type={ExplorerItemType.File}
                                onSuccess={() => fetchParentSnippets()}
                            />
                        )}

                        {snippets.map((snip) => (
                            <div key={snip.id} onClick={(e) => e.stopPropagation()}>
                                {isEditingSnippet && selectedItem === snip.id ? (
                                    <TreeItemEdit
                                        type={ExplorerItemType.File}
                                        item={snip}
                                        onSuccess={() => {
                                            setIsEditingSnippet(false);
                                            setSnippets(prev =>
                                                prev.map(s =>
                                                    s.id === snip.id ? { ...s, title: snip.title } : s
                                                )
                                            );
                                        }}
                                    />
                                ) : (
                                    // Wrap root-level files so they register as draggable sources
                                    <TreeItemDropContainer dto={snip} type={ExplorerItemType.File}>
                                        <TreeItem
                                            item={{ id: snip.id, title: snip.title, userId: session?.user.id! } as Snippet}
                                            type={ExplorerItemType.File}
                                            onDelete={(id) => setSnippets(prev => prev.filter(s => s.id !== id))}
                                        />
                                    </TreeItemDropContainer>
                                )}
                            </div>
                        ))}

                        {!loading && libraries.length === 0 && snippets.length === 0 && (
                            <div className="text-center py-12 px-4">
                                <p className="text-[#858585] text-[13px]">No files or folders</p>
                                <p className="text-[#6e6e6e] text-[11px] mt-1">Click the icons above to get started</p>
                            </div>
                        )}
                    </>
                )}
            </RootDropZone>
        </DragDropProvider>
    );
}