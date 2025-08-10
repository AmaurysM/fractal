"use client"

import { useEffect, useState } from "react";
import { Library, Snippet } from "../lib/types";
import { BiChevronRight, BiFolder, BiFile, BiPlus, BiTrash } from "react-icons/bi";
import { TreeItemCreation } from "./TreeItemCreation";

export const TreeItem = (
    {
        item,
        type,
        level = 0,
        selectedItem,
        creatingFolder,
        isCreatingFolder,
        onSelect,
        onCreateFolder,
        onCancelFolderCreation,
        onCreateFile,
        onDelete,
        //children
    }: {
        item: Library | Snippet;
        type: 'folder' | 'file';
        level?: number;
        selectedItem: Library | Snippet | null | undefined;
        creatingFolder?: (creating: boolean) => void;
        isCreatingFolder?: boolean;
        onSelect: (item: Library | Snippet | null | undefined) => void;
        onCreateFolder?: (title: string, parentId?: string) => void;
        onCancelFolderCreation: () => void;
        onCreateFile?: (parentId: string) => void;
        onDelete?: (libraryId: string) => void;
        //children?: React.ReactNode;
    }
) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [childFolders, setChildFolders] = useState<Library[]>();
    const [childFiles, setChildFiles] = useState<Snippet[]>();

    const [loadingChildren, setLoadingChildren] = useState(false);

    const isSelected = selectedItem?.Id == item.Id;

    const fetchLibrarys = async (libraryId: string) => {
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

    const fetchFiles = async (libraryId: string) => {
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
        if (isExpanded == true) {
            fetchLibrarys(item.Id);
            fetchFiles(item.Id);
        }
    }, [isExpanded]);

    const paddingLeft = level * 16 + 12;

    return (
        <div>
            <div
                className={`flex items-center py-1 px-2 cursor-pointer transition-colors ${isSelected
                    ? 'bg-gray-700 border-l-2 px-1 py-0 border-blue-500'
                    : isHovered
                        ? 'bg-gray-700'
                        : ''
                    }`}
                style={{ paddingLeft }}
                onClick={
                    () => {
                        if (type === 'folder') {
                            setIsExpanded(!isExpanded);
                            creatingFolder?.(false);
                        }
                        onSelect(item);
                    }
                }

                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === 'folder' && (
                    <BiChevronRight
                        className={`w-3 h-3 text-gray-400 transition-transform mr-1 ${isExpanded ? 'rotate-90' : ''
                            }`}

                    />
                )}

                {type === 'folder' ? (
                    <BiFolder className="w-4 h-4 text-blue-500 mr-2" />
                ) : (
                    <BiFile className="w-4 h-4 text-gray-500 mr-2" />
                )}

                <span className="flex-1 text-sm truncate">
                    {type === 'folder'
                        ? (item as Library).LibraryName
                        : (item as Snippet).Title
                    }
                </span>

                {isHovered && (
                    <div className="flex items-center gap-1 ml-2">
                        {type === 'folder' && onCreateFolder && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    creatingFolder?.(true);
                                    setIsExpanded(true);
                                    //onCreateFolder(item.Id);

                                }}
                                className="p-1 hover:bg-blue-200 rounded"
                                title="New folder"
                            >
                                <BiFolder className="w-3 h-3" />
                            </button>
                        )}

                        {type === 'file' && onCreateFile && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateFile(item.Id);
                                }}
                                className="p-1 hover:bg-blue-200 rounded"
                                title="New file"
                            >
                                <BiPlus className="w-3 h-3" />
                            </button>
                        )}

                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.Id);
                                }}
                                className="p-1 hover:bg-red-200 rounded"
                                title="Delete"
                            >
                                <BiTrash className="w-3 h-3 text-red-500" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {type === 'folder' && isExpanded && (
                <div>

                    {isCreatingFolder && isSelected &&
                        <TreeItemCreation
                            level={level + 1}
                            type="folder"
                            parentId={item.Id}
                            onConfirm={
                                onCreateFolder
                                    ? (title: string) => onCreateFolder(title, item.Id)
                                    : () => { }
                            }
                            onCancel={onCancelFolderCreation}

                        />
                    }

                    {childFolders && childFolders.map((lib) => (
                        <div key={lib.Id} onClick={(e) => {
                            e.stopPropagation(); // Prevent the parent onClick from firing
                            onSelect(lib);
                        }}>
                            <TreeItem
                                item={lib}
                                type='folder'
                                level={level + 1}
                                creatingFolder={creatingFolder}
                                isCreatingFolder={isCreatingFolder}
                                selectedItem={selectedItem}
                                onSelect={(lib) => {
                                    onSelect(lib); // Update the selected item
                                }}
                                onCreateFolder={onCreateFolder}
                                onCancelFolderCreation={onCancelFolderCreation}
                            />
                        </div>
                    ))}

                    {childFiles && childFiles.map((file) => (
                        <div key={file.Id} onClick={(e) => {
                            e.stopPropagation(); // Prevent the parent onClick from firing
                            onSelect(file);
                        }}>
                            <TreeItem
                                item={file}
                                type='file'
                                level={level + 1}
                                creatingFolder={creatingFolder}
                                selectedItem={selectedItem}
                                onSelect={(file) => {
                                    onSelect(file); // Update the selected item
                                }}
                                onCancelFolderCreation={onCancelFolderCreation}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}