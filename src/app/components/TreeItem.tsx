"use client"

import { useEffect, useState, useRef } from "react";
import { Library, Snippet, ExplorerItemType } from "../../../types/types";
import { BiChevronRight, BiFolder, BiTrash } from "react-icons/bi";
import { VscNewFolder, VscNewFile } from "react-icons/vsc";
import { AiOutlineFileText } from "react-icons/ai";
import { TreeItemCreation } from "./TreeItemCreation";
import { CgRename } from "react-icons/cg";
import { useLibrary } from "../hooks/useLibrary";
import { useLibraryStore } from "../store/libraryStore";
import { useSnippet } from "../hooks/useSnippet";
import { useSession } from "next-auth/react";
import { LibraryDTO } from "../api/libraries/parents/route";
import { SnippetDTO } from "../api/snippets/parents/route";
import { getLanguageConfig } from "../../../types/languages";
import { ContextMenu } from "./ContextMenu";
import { TreeItemDropContainer } from "./TreeItemDropContainer";
import { useTreeStore } from "../store/treeStore";

export const TreeItem = ({
    item,
    type,
    level = 0,
    parentId = null,
    onDelete,
}: {
    item: Library | Snippet;
    type: ExplorerItemType;
    level?: number;
    parentId?: string | null;
    onDelete?: (id: string) => void;
}) => {
    const { fetchParentLibraries, deleteLibrary, editLibraryTitle } = useLibrary();
    const { fetchParentSnippets, fetchSnippet, deleteSnippet, editSnippetTitle } = useSnippet();

    const {
        addingSnippet,
        addingLibrary,
        isEditingSnippet,
        setIsEditingSnippet,
        setAddingLibrary,
        setAddingSnippet,
        selectedItem,
        setSelectedItem,
        setIsEditingFolder,
        isEditingFolder,
    } = useLibraryStore();

    const { cache, setFolder, expandFolder, collapseFolder, isFolderExpanded } = useTreeStore();
    const { data: session } = useSession();

    const [currentItem, setCurrentItem] = useState<Library | Snippet>(item);
    const [isHovered, setIsHovered] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editTitle, setEditTitle] = useState(item.title);
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isSelected = selectedItem === item.id;
    const isFolder = type === ExplorerItemType.Folder;
    const isExpanded = isFolder ? isFolderExpanded(item.id) : false;

    const isEditingThis =
        isSelected &&
        (isFolder ? isEditingFolder : isEditingSnippet);

    const folderId = currentItem.id;
    const folderContents = isFolder ? cache[folderId] : undefined;
    const libraries = folderContents?.libs ?? [];
    const snippets = folderContents?.snips ?? [];
    const loadingChildren = isFolder && isExpanded && folderContents === undefined;

    const langConfig = !isFolder
        ? getLanguageConfig((currentItem as Snippet).language)
        : null;
    const FileIcon = langConfig?.icon || AiOutlineFileText;

    useEffect(() => {
        if (!session) return;
        if (!isFolder) return;
        if (!isExpanded) return;
        if (folderContents !== undefined) return;

        const load = async () => {
            try {
                const [libs, snips] = await Promise.all([
                    fetchParentLibraries(folderId),
                    fetchParentSnippets(folderId),
                ]);
                setFolder(folderId, { libs: libs ?? [], snips: snips ?? [] });
            } catch (err) {
                console.error("Failed to load folder contents:", err);
                setFolder(folderId, { libs: [], snips: [] });
            }
        };

        load();
    }, [isExpanded, session, folderId, folderContents]);

    useEffect(() => {
        if (!session) return;
        if (type !== ExplorerItemType.File) return;

        fetchSnippet(currentItem.id).then((updated) => {
            if (updated) setCurrentItem(updated);
        });
    }, [session, currentItem.id]);

    useEffect(() => {
        if (isEditingThis) {
            setEditTitle(currentItem.title);
            setEditError(null);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isEditingThis]);

    useEffect(() => {
        if (!editError) return;
        const t = setTimeout(() => setEditError(null), 3000);
        return () => clearTimeout(t);
    }, [editError]);

    const commitEdit = async () => {
        if (!editTitle.trim()) {
            setEditError("Name cannot be empty");
            return;
        }
        setIsSaving(true);
        setEditError(null);
        try {
            if (isFolder) {
                await editLibraryTitle(item.id, editTitle);
            } else {
                await editSnippetTitle(item.id, editTitle);
            }
            setCurrentItem((prev) => ({ ...prev, title: editTitle }));
            exitEditMode();
        } catch (err) {
            setEditError((err as Error).message || "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        if (isSaving) return;
        setEditError(null);
        exitEditMode();
    };

    const exitEditMode = () => {
        if (isFolder) {
            setIsEditingFolder(false);
        } else {
            setIsEditingSnippet(false);
        }
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isSaving) return;
        if (e.key === "Enter") commitEdit();
        if (e.key === "Escape") cancelEdit();
    };

    const handleEditBlur = () => {
        if (isSaving || editError) return;
        if (editTitle.trim()) commitEdit();
        else cancelEdit();
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (isFolder) {
                await deleteLibrary(item.id);
            } else {
                await deleteSnippet(item.id);
            }
            onDelete?.(item.id);
        } catch (err) {
            console.error("Failed to delete:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const getContextMenuItems = () => {
        const items = [];

        if (isFolder) {
            items.push({
                label: "New Folder",
                icon: <VscNewFolder className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    expandFolder(item.id);
                    setAddingLibrary(true);
                },
            });
            items.push({
                label: "New File",
                icon: <VscNewFile className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    expandFolder(item.id);
                    setAddingSnippet(true);
                },
            });
            items.push({
                label: "Change Name",
                icon: <CgRename className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    setIsEditingFolder(true);
                },
            });
        } else {
            items.push({
                label: "New File",
                icon: <VscNewFile className="w-4 h-4" />,
                onClick: () => {
                    if (parentId) {
                        setSelectedItem(parentId, ExplorerItemType.Folder);
                        expandFolder(parentId);
                    } else {
                        setSelectedItem(null);
                    }
                    setAddingSnippet(true);
                },
            });
            items.push({
                label: "Change Name",
                icon: <CgRename className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.File, parentId);
                    setIsEditingSnippet(true);
                },
            });
        }

        items.push({
            label: "Delete",
            icon: <BiTrash className="w-4 h-4" />,
            onClick: handleDelete,
            danger: true,
        });

        return items;
    };

    const paddingLeft = level * 12;

    return (
        <div className={isDeleting ? "opacity-40 pointer-events-none" : ""}>
            <div
                style={{ paddingLeft }}
                className={`flex items-center h-5.5 cursor-pointer transition-colors select-none ${
                    isSelected ? "bg-[#37373d]" : isHovered ? "bg-[#2a2d2e]" : ""
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isEditingThis) return;
                    if (loadingChildren) return;
                    if (isFolder) {
                        isExpanded ? collapseFolder(item.id) : expandFolder(item.id);
                        setAddingLibrary(false);
                    }
                    setSelectedItem(currentItem.id, type, parentId);
                }}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex w-9 justify-center items-center">
                    {isFolder && (
                        <BiChevronRight
                            className={`w-3 h-3 text-[#cccccc] transition-transform mr-0.5 shrink-0 ${
                                isExpanded ? "rotate-90" : ""
                            } ${loadingChildren ? "opacity-50" : ""}`}
                        />
                    )}
                    {isFolder ? (
                        <BiFolder className="w-4 h-4 mr-1.5 shrink-0 text-[#dcb67a]" />
                    ) : (
                        <FileIcon
                            className="w-4 h-4 mr-1.5 shrink-0"
                            style={{ color: langConfig?.color || "#cccccc" }}
                        />
                    )}
                </div>

                {isEditingThis ? (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => {
                                setEditTitle(e.target.value);
                                setEditError(null);
                            }}
                            onKeyDown={handleEditKeyDown}
                            onBlur={handleEditBlur}
                            disabled={isSaving}
                            placeholder={isFolder ? "Folder name" : "File name"}
                            className={`
                                flex-1 text-sm bg-transparent text-white
                                border-b placeholder-gray-400 focus:outline-none min-w-10
                                ${editError ? "border-red-500" : "border-gray-500 focus:border-blue-500"}
                                ${isSaving ? "cursor-not-allowed opacity-60" : ""}
                            `}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {isSaving && (
                            <div className="flex-none ml-2 w-2.5 h-2.5 border border-[#cccccc] border-t-transparent rounded-full animate-spin mr-2" />
                        )}
                    </>
                ) : (
                    <>
                        <span className="flex-1 text-[13px] truncate text-[#cccccc] font-normal">
                            {currentItem.title}
                        </span>
                        {!isFolder && (
                            <span className="text-[11px] text-[#858585] mr-2 shrink-0">
                                .{langConfig?.ext}
                            </span>
                        )}
                        {loadingChildren && (
                            <div className="w-2.5 h-2.5 border border-[#cccccc] border-t-transparent rounded-full animate-spin mr-2" />
                        )}
                    </>
                )}
            </div>

            {isEditingThis && editError && (
                <div
                    className="text-xs text-red-400 py-1 px-2"
                    style={{ paddingLeft: paddingLeft + 36 }}
                >
                    {editError}
                </div>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    items={getContextMenuItems()}
                />
            )}

            {isFolder && isExpanded && (
                <div>
                    {addingLibrary && isSelected && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.Folder}
                            parentId={item.id}
                            onSuccess={(newItem) =>
                                setFolder(folderId, {
                                    libs: [...libraries, newItem as LibraryDTO],
                                    snips: snippets,
                                })
                            }
                        />
                    )}

                    {libraries.map((lib) => (
                        <div
                            key={lib.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(lib.id, ExplorerItemType.Folder, item.id);
                            }}
                        >
                            <TreeItemDropContainer
                                dto={lib}
                                parentId={item.id}
                                type={ExplorerItemType.Folder}
                            >
                                <TreeItem
                                    item={{ id: lib.id, userid: session?.user.id!, title: lib.title } as Library}
                                    type={ExplorerItemType.Folder}
                                    level={level + 1}
                                    parentId={item.id}
                                    onDelete={(id) =>
                                        setFolder(folderId, {
                                            libs: libraries.filter((l) => l.id !== id),
                                            snips: snippets,
                                        })
                                    }
                                />
                            </TreeItemDropContainer>
                        </div>
                    ))}

                    {addingSnippet && isSelected && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.File}
                            parentId={item.id}
                            onSuccess={(newItem) =>
                                setFolder(folderId, {
                                    libs: libraries,
                                    snips: [...snippets, newItem as SnippetDTO],
                                })
                            }
                        />
                    )}

                    {snippets.map((snip) => (
                        <div
                            key={snip.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(snip.id, ExplorerItemType.File, item.id);
                            }}
                        >
                            <TreeItemDropContainer
                                dto={snip}
                                parentId={item.id}
                                type={ExplorerItemType.File}
                            >
                                <TreeItem
                                    item={{ id: snip.id, title: snip.title, userId: session?.user.id! } as Snippet}
                                    type={ExplorerItemType.File}
                                    level={level + 1}
                                    parentId={item.id}
                                    onDelete={(id) =>
                                        setFolder(folderId, {
                                            libs: libraries,
                                            snips: snippets.filter((s) => s.id !== id),
                                        })
                                    }
                                />
                            </TreeItemDropContainer>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};