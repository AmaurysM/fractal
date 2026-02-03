"use client"

import { useEffect, useState, useRef } from "react";
import { Library, Snippet, ExplorerItemType } from "../../../types/types";
import { BiChevronRight, BiFolder, BiFile, BiPlus, BiTrash } from "react-icons/bi";
import { TreeItemCreation } from "./TreeItemCreation";
import { useAppStore } from "../store/useAppStore";

const ContextMenu = ({
    x,
    y,
    onClose,
    items
}: {
    x: number;
    y: number;
    onClose: () => void;
    items: Array<{ label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }>;
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed bg-gray-800 border border-gray-700 rounded-xs shadow-lg py-1 z-50 min-w-[180px]"
            style={{ left: x, top: y }}
        >
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={`w-full flex items-center gap-2 px-2  text-sm text-left transition-colors ${item.danger
                        ? 'hover:bg-red-900/30 text-red-400'
                        : 'hover:bg-gray-700 text-gray-200'
                        }`}
                >
                    {item.icon}
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export const TreeItem = (
    {
        item,
        type,
        parentId,
        level = 0,
    }: {
        item: Library | Snippet;
        type: ExplorerItemType;
        parentId?: string;
        level?: number;
    }
) => {

    const {
        user,
        deleteFolder,
        deleteSnippet,
        setIsAddingLibrary,
        isAddingLibrary,
        setIsAddingSnippet,
        isAddingSnippet,
        handleTreeItemSelect,
        lastSelectedItem,
        fetchParentLibraries,
        fetchParentSnippets,
        getLibraryParentId,
        getSnippetParentId,
    } = useAppStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [childFolders, setChildFolders] = useState<Library[]>();
    const [childFiles, setChildFiles] = useState<Snippet[]>();
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [shouldShowCreation, setShouldShowCreation] = useState(false);

    const isSelected = lastSelectedItem?.id == item.id;

    const fetchLibraries = async (libraryId: string) => {
        setLoadingChildren(true);
        try {
            const res = await fetch(`api/libraries/children`, {
                method: "GET",
                headers: {
                    "x-library-id": libraryId
                }
            });
            if (!res.ok) throw new Error("Failed to fetch child librarys");
            const data: Library[] = await res.json();
            setChildFolders(data);
        } catch (error) {
            console.log("Failed To Fetch Libraries: " + (error as Error).message);
            setChildFolders([]);
        } finally {
            setLoadingChildren(false);
        }
    }

    const fetchSnippets = async (libraryId: string) => {
        setLoadingChildren(true);
        try {
            const res = await fetch(`api/snippets/library`, {
                method: "GET",
                headers: {
                    "x-library-id": libraryId
                }
            });
            if (!res.ok) throw new Error("Failed to fetch child files");
            const data: Snippet[] = await res.json();
            setChildFiles(data);
        } catch (error) {
            console.log("Failed To Fetch Libraries: " + (error as Error).message);
            setChildFiles([]);
        } finally {
            setLoadingChildren(false);
        }
    }

    useEffect(() => {
        if (!user) return;
        if (isExpanded == true) {
            fetchLibraries(item.id)
            fetchSnippets(item.id)
        }
    }, [isExpanded]);

    useEffect(() => {
        if (!user) return;
        if ((isAddingLibrary || isAddingSnippet) && isSelected) {
            setIsExpanded(true)
        }
    }, [isAddingLibrary, isAddingSnippet]);

    // Check if this folder should show creation components
    useEffect(() => {
        const checkIfShouldShowCreation = () => {
            if (!lastSelectedItem) {
                // Nothing selected - don't show creation in nested folders
                setShouldShowCreation(false);
                return;
            }

            // CASE 1: A Folder/Library is selected
            if ('title' in lastSelectedItem && !('text' in lastSelectedItem)) {
                // Show creation INSIDE the selected folder only
                if (isSelected && type === ExplorerItemType.Folder) {
                    console.log(`Folder "${(item as Library).title}" is selected - showing creation inside`);
                    setShouldShowCreation(true);
                } else {
                    setShouldShowCreation(false);
                }
                return;
            }

            // CASE 2: A File/Snippet is selected
            if ('text' in lastSelectedItem) {
                console.log(`File "${(lastSelectedItem as Snippet).title}" is selected`);
                console.log(`File's parent from TreeItem: ${parentId}, Current folder ID: ${item.id}, Folder title: ${(item as Library).title}`);

                // This file is rendered inside THIS folder, so parentId should match item.id
                // But we need to check if the SELECTED file's parent matches THIS folder
                // We need to find which TreeItem rendered the selected file
                // Actually, we should check if this folder's children include the selected file

                // Show creation in the parent folder (where the file lives)
                if (type === ExplorerItemType.Folder && childFiles?.some(f => f.id === lastSelectedItem.id)) {
                    console.log(`✓ This folder contains the selected file - showing creation`);
                    setShouldShowCreation(true);
                } else {
                    setShouldShowCreation(false);
                }
                return;
            }

            setShouldShowCreation(false);
        };

        if (type === ExplorerItemType.Folder && (isAddingLibrary || isAddingSnippet)) {
            checkIfShouldShowCreation();
        } else {
            setShouldShowCreation(false);
        }
    }, [lastSelectedItem, isAddingLibrary, isAddingSnippet, type, isSelected, item.id, childFiles]);

    // Auto-expand when this folder should show creation
    useEffect(() => {
        if (shouldShowCreation && type === ExplorerItemType.Folder) {
            setIsExpanded(true);
            // Also fetch children if not already loaded
            if (!childFolders && !childFiles && !loadingChildren) {
                fetchLibraries(item.id);
                fetchSnippets(item.id);
            }
        }
    }, [shouldShowCreation]);


    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // In TreeItem.tsx - update the handleDelete function
const handleDelete = async () => {
    setIsDeleting(true);
    try {
        if (type === ExplorerItemType.Folder) {
            await deleteFolder(item.id);
        } else {
            await deleteSnippet(item.id);
        }
        // No need for manual cleanup - the store handles it!
    } catch (error) {
        console.error("Failed to delete:", error);
    } finally {
        setIsDeleting(false);
    }
};

    const getContextMenuItems = () => {
        const items = [];

        if (type === ExplorerItemType.Folder) {
            items.push({
                label: 'New Folder',
                icon: <BiFolder className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item); // Select this folder first
                    setIsAddingLibrary(true);
                    setIsExpanded(true);
                }
            });
            items.push({
                label: 'New Snippet',
                icon: <BiFile className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item); // Select this folder first
                    setIsAddingSnippet(true);
                    setIsExpanded(true);
                }
            });
        } else {
            // For files, we want to create in the parent
            items.push({
                label: 'New Folder',
                icon: <BiFolder className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item); // Select this file
                    setIsAddingLibrary(true);
                }
            });
            items.push({
                label: 'New Snippet',
                icon: <BiFile className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item); // Select this file
                    setIsAddingSnippet(true);
                }
            });
        }

        items.push({
            label: 'Delete',
            icon: <BiTrash className="w-4 h-4" />,
            onClick: handleDelete,
            danger: true
        });

        return items;
    };

    const paddingLeft = level * 16 + 12;

    if (!user) return;

    return (
        <div className={isDeleting ? 'opacity-50 pointer-events-none' : ''}>
            <div
                className={`flex items-center border-l-2 px-1 py-0 border-[#1D232A] cursor-pointer transition-colors ${isSelected
                    ? 'bg-gray-700 border-l-2 px-1 py-0 border-blue-500'
                    : isHovered
                        ? 'bg-gray-700 border-gray-700'
                        : ''
                    }`}
                style={{ paddingLeft }}
                onClick={() => {
                    if (loadingChildren) return;

                    if (type === ExplorerItemType.Folder) {
                        setIsExpanded(!isExpanded);
                        setIsAddingLibrary(false);
                    }

                    handleTreeItemSelect(item);
                }}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === ExplorerItemType.Folder && (
                    <BiChevronRight
                        className={`w-3 h-3 text-gray-400 transition-transform mr-1 ${isExpanded ? 'rotate-90' : ''
                            } ${loadingChildren ? 'animate-pulse' : ''}`}
                    />
                )}

                {type === ExplorerItemType.Folder ? (
                    <BiFolder className="w-4 h-4 text-blue-500 mr-2" />
                ) : (
                    <BiFile className="w-4 h-4 text-gray-500 mr-2" />
                )}

                <span className="flex-1 text-sm truncate">
                    {type === ExplorerItemType.Folder
                        ? (item as Library).title
                        : (item as Snippet).title
                    }
                </span>

                {loadingChildren && (
                    <div className="w-3 h-3 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
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
                    {/* Folder creation - show if this folder should have the creation component */}
                    {isAddingLibrary && shouldShowCreation && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.Folder}
                            parentId={item.id}
                            onSuccess={() => fetchLibraries(item.id)}
                        />
                    )}

                    {/* Child folders */}
                    {!loadingChildren && childFolders?.map((lib) => (
                        <div key={lib.id} onClick={(e) => { e.stopPropagation(); handleTreeItemSelect(lib); }}>
                            <TreeItem
                                item={lib}
                                type={ExplorerItemType.Folder}
                                parentId={item.id}
                                level={level + 1}
                            />
                        </div>
                    ))}

                    {/* Snippet creation - show if this folder should have the creation component */}
                    {isAddingSnippet && shouldShowCreation && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.File}
                            parentId={item.id}
                            onSuccess={() => fetchSnippets(item.id)}
                        />
                    )}

                    {/* Child files */}
                    {!loadingChildren && childFiles?.map((file) => (
                        <div key={file.id} onClick={(e) => { e.stopPropagation(); handleTreeItemSelect(file); }}>
                            <TreeItem
                                item={file}
                                type={ExplorerItemType.File}
                                parentId={item.id}
                                level={level + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}