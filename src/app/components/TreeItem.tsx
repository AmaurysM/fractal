"use client"

import { useEffect, useState, useRef, useCallback } from "react";
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
import { LanguageConfig, getLanguageConfig, inferLanguageFromTitle } from "../../../types/languages";
import { ContextMenu } from "./ContextMenu";
import { TreeItemDropContainer } from "./TreeItemDropContainer";
import { useTreeStore, validateItemName } from "../store/treeStore";
import { getTabStore } from "../store/tabStore";

function stripExtension(title: string): string {
    const dot = title.lastIndexOf(".");
    return dot > 0 ? title.slice(0, dot) : title;
}

function getExtension(title: string): string {
    const dot = title.lastIndexOf(".");
    return dot > 0 ? title.slice(dot + 1) : "";
}

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
    const { fetchParentSnippets, fetchSnippet, deleteSnippet, editSnippetTitle, editSnippet } = useSnippet();

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

    const { data: session } = useSession();
    const useTabStore = getTabStore(session?.user?.id ?? "guest");
    const { addTab, updateTab } = useTabStore();

    const {
        cache,
        setFolder,
        expandFolder,
        collapseFolder,
        isFolderExpanded,
        getSiblingNames,
        renameItem,
    } = useTreeStore();

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

    const langConfig: LanguageConfig | null = !isFolder
        ? (getLanguageConfig((currentItem as Snippet).language) ??
            inferLanguageFromTitle(currentItem.title) ??
            null)
        : null;
    const FileIcon = langConfig?.icon ?? AiOutlineFileText;

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
            setTimeout(() => {
                if (!inputRef.current) return;
                inputRef.current.focus();
                if (!isFolder) {
                    const bare = stripExtension(currentItem.title);
                    inputRef.current.setSelectionRange(0, bare.length);
                } else {
                    inputRef.current.select();
                }
            }, 0);
        }
    }, [isEditingThis]);

    useEffect(() => {
        if (!editError) return;
        const t = setTimeout(() => setEditError(null), 3000);
        return () => clearTimeout(t);
    }, [editError]);

    const containingFolderId = parentId ?? "root";

    const getValidationError = useCallback(
        (name: string) => {
            const siblingNames = getSiblingNames(containingFolderId, isFolder, item.id);
            return validateItemName(name, siblingNames, currentItem.title);
        },
        [containingFolderId, isFolder, item.id, currentItem.title, getSiblingNames],
    );

    const commitEdit = async () => {
        const trimmed = editTitle.trim();
        const validationError = getValidationError(trimmed);
        if (validationError) {
            setEditError(validationError);
            return;
        }

        setIsSaving(true);
        setEditError(null);
        try {
            if (isFolder) {
                await editLibraryTitle(item.id, trimmed);
                setCurrentItem((prev) => ({ ...prev, title: trimmed }));
                renameItem(containingFolderId, item.id, trimmed, true);
            } else {
                const hasExt = trimmed.includes(".");
                const originalExt = getExtension(currentItem.title);
                const finalTitle =
                    hasExt || !originalExt ? trimmed : `${trimmed}.${originalExt}`;

                await editSnippetTitle(item.id, finalTitle);

                const inferredConfig = inferLanguageFromTitle(finalTitle);
                const newLangValue = inferredConfig?.value;
                const currentLangValue = (currentItem as Snippet).language;
                const langChanged =
                    newLangValue !== undefined && newLangValue !== currentLangValue;

                const updatedSnippet: Snippet = {
                    ...(currentItem as Snippet),
                    title: finalTitle,
                    ...(langChanged ? { language: newLangValue } : {}),
                };

                if (langChanged) {
                    await editSnippet(updatedSnippet);
                }

                setCurrentItem(updatedSnippet);

                renameItem(containingFolderId, item.id, finalTitle, false);

                updateTab(updatedSnippet);
            }

            exitEditMode();
        } catch (err) {
            setEditError((err as Error).message || "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        if (isSaving) return;
        setEditTitle(currentItem.title);
        setEditError(null);
        exitEditMode();
    };

    const exitEditMode = () => {
        if (isFolder) setIsEditingFolder(false);
        else setIsEditingSnippet(false);
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

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEditTitle(val);
        if (editError && val.trim()) setEditError(null);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (isFolder) await deleteLibrary(item.id);
            else await deleteSnippet(item.id);
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
                label: "Rename",
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
                label: "Rename",
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

    const previewLangConfig: LanguageConfig | null = isEditingThis && !isFolder
        ? (inferLanguageFromTitle(editTitle) ?? langConfig)
        : langConfig;
    const PreviewIcon = previewLangConfig?.icon ?? FileIcon;

    return (
        <div className={isDeleting ? "opacity-40 pointer-events-none" : ""}>
            <div
                style={{ paddingLeft }}
                className={`flex items-center h-5.5 cursor-pointer transition-colors select-none ${isSelected ? "bg-[#37373d]" : isHovered ? "bg-[#2a2d2e]" : ""
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isEditingThis) return;
                    if (loadingChildren) return;
                    if (isFolder) {
                        isExpanded ? collapseFolder(item.id) : expandFolder(item.id);
                        setAddingLibrary(false);
                    } else {
                        addTab(currentItem.id);
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
                            className={`w-3 h-3 text-[#cccccc] transition-transform mr-0.5 shrink-0 ${isExpanded ? "rotate-90" : ""
                                } ${loadingChildren ? "opacity-50" : ""}`}
                        />
                    )}

                    {isFolder ? (
                        <BiFolder className="w-4 h-4 mr-1.5 shrink-0 text-[#dcb67a]" />
                    ) : (
                        <PreviewIcon
                            className="w-4 h-4 mr-1.5 shrink-0 transition-colors"
                            style={{ color: previewLangConfig?.color ?? "#cccccc" }}
                        />
                    )}
                </div>

                {isEditingThis ? (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={handleEditChange}
                            onKeyDown={handleEditKeyDown}
                            onBlur={handleEditBlur}
                            disabled={isSaving}
                            placeholder={isFolder ? "Folder name" : "File name"}
                            className={`
                                flex-1 text-sm bg-transparent text-white
                                border-b placeholder-gray-400 focus:outline-none min-w-10
                                ${editError
                                    ? "border-red-500"
                                    : "border-gray-500 focus:border-blue-500"}
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
                            {isFolder ? currentItem.title : stripExtension(currentItem.title)}
                        </span>
                        {!isFolder && (
                            <span className="text-[11px] text-[#858585] mr-2 shrink-0">
                                {getExtension(currentItem.title)
                                    ? `.${getExtension(currentItem.title)}`
                                    : ""}
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
                    className="text-xs text-red-400 py-1 px-2 leading-tight"
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