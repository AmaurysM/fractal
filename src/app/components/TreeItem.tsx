"use client"

import { useEffect, useState } from "react";
import { Library, Snippet, ExplorerItemType } from "../../../types/types";
import { BiChevronRight, BiFolder, BiTrash } from "react-icons/bi";
import { VscNewFolder, VscNewFile } from "react-icons/vsc";
import { AiOutlineFileText } from "react-icons/ai";
import { TreeItemCreation } from "./TreeItemCreation";
import { CgRename } from "react-icons/cg";
import { TreeItemEdit } from "./TreeItemEdit";
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
    const { fetchParentLibraries, deleteLibrary } = useLibrary();
    const { fetchParentSnippets, fetchSnippet, deleteSnippet } = useSnippet();

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

    const { cache, setFolder } = useTreeStore();
    const { data: session } = useSession();

    const [currentItem, setCurrentItem] = useState<Library | Snippet>(item);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isSelected    = selectedItem === item.id;
    const folderId      = currentItem.id;
    const folderContents = type === ExplorerItemType.Folder ? cache[folderId] : undefined;
    const libraries     = folderContents?.libs  ?? [];
    const snippets      = folderContents?.snips ?? [];
    const loadingChildren = type === ExplorerItemType.Folder && isExpanded && folderContents === undefined;

    const langConfig = type === ExplorerItemType.File
        ? getLanguageConfig((currentItem as Snippet).language)
        : null;
    const FileIcon = langConfig?.icon || AiOutlineFileText;

    // Load folder contents on first expand (cache miss)
    useEffect(() => {
        if (!session) return;
        if (type !== ExplorerItemType.Folder) return;
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

    // Load snippet metadata when rendered as a file
    useEffect(() => {
        if (!session) return;
        if (type !== ExplorerItemType.File) return;

        fetchSnippet(currentItem.id).then((updated) => {
            if (updated) setCurrentItem(updated);
        });
    }, [session, currentItem.id]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (type === ExplorerItemType.Folder) {
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

        if (type === ExplorerItemType.Folder) {
            items.push({
                label: "New Folder",
                icon: <VscNewFolder className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    setAddingLibrary(true);
                    setIsExpanded(true);
                },
            });
            items.push({
                label: "New File",
                icon: <VscNewFile className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    setAddingSnippet(true);
                    setIsExpanded(true);
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

    const paddingLeft = level * 12 + 8;

    return (
        <div className={isDeleting ? "opacity-40 pointer-events-none" : ""}>
            <div
                style={{ paddingLeft }}
                className={`flex items-center h-5.5 cursor-pointer transition-colors select-none ${
                    isSelected ? "bg-[#37373d]" : isHovered ? "bg-[#2a2d2e]" : ""
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (loadingChildren) return;
                    if (type === ExplorerItemType.Folder) {
                        setIsExpanded((x) => !x);
                        setAddingLibrary(false);
                    }
                    setSelectedItem(currentItem.id, type, parentId);
                }}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === ExplorerItemType.Folder && (
                    <BiChevronRight
                        className={`w-3 h-3 text-[#cccccc] transition-transform mr-0.5 shrink-0 ${
                            isExpanded ? "rotate-90" : ""
                        } ${loadingChildren ? "opacity-50" : ""}`}
                    />
                )}
                {type === ExplorerItemType.Folder ? (
                    <BiFolder className="w-4 h-4 mr-1.5 shrink-0 text-[#dcb67a]" />
                ) : (
                    <FileIcon
                        className="w-4 h-4 mr-1.5 shrink-0"
                        style={{ color: langConfig?.color || "#cccccc" }}
                    />
                )}
                <span className="flex-1 text-[13px] truncate text-[#cccccc] font-normal">
                    {type === ExplorerItemType.Folder
                        ? (item as Library).title
                        : (item as Snippet).title}
                </span>
                {type === ExplorerItemType.File && (
                    <span className="text-[11px] text-[#858585] mr-2 shrink-0">
                        .{langConfig?.ext}
                    </span>
                )}
                {loadingChildren && (
                    <div className="w-2.5 h-2.5 border border-[#cccccc] border-t-transparent rounded-full animate-spin mr-2" />
                )}
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    items={getContextMenuItems()}
                />
            )}

            {type === ExplorerItemType.Folder && isExpanded && (
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
                            {isEditingFolder && selectedItem === lib.id ? (
                                <TreeItemEdit
                                    level={level + 1}
                                    type={ExplorerItemType.Folder}
                                    item={lib}
                                    onSuccess={() => {
                                        // TreeItemEdit mutates lib.title in place before calling onSuccess
                                        setIsEditingFolder(false);
                                        setFolder(folderId, {
                                            libs: libraries.map((l) =>
                                                l.id === lib.id ? { ...l, title: lib.title } : l
                                            ),
                                            snips: snippets,
                                        });
                                    }}
                                />
                            ) : (
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
                            )}
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
                            {isEditingSnippet && selectedItem === snip.id ? (
                                <TreeItemEdit
                                    level={level + 1}
                                    type={ExplorerItemType.File}
                                    item={snip}
                                    onSuccess={() => {
                                        // TreeItemEdit mutates snip.title in place before calling onSuccess
                                        setIsEditingSnippet(false);
                                        setFolder(folderId, {
                                            libs: libraries,
                                            snips: snippets.map((s) =>
                                                s.id === snip.id ? { ...s, title: snip.title } : s
                                            ),
                                        });
                                    }}
                                />
                            ) : (
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
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};