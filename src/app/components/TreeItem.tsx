"use client"

import { useEffect, useState } from "react";
import { Library, Snippet, ExplorerItemType } from "../../../types/types";
import { BiChevronRight, BiFolder, BiFile, BiPlus, BiTrash } from "react-icons/bi";
import { TreeItemCreation } from "./TreeItemCreation";
import { useSSE } from "../lib/useSSE";

export const TreeItem = (
    {
        item,
        type,
        level = 0,
        selectedItem,
        creatingFolder,
        isCreatingFolder,
        creatingFile,
        isCreatingFile,
        onSelect,
        onCreateFolder,
        onCancelFolderCreation,
        onCreateFile,
        onCancelFileCreation,
        onDeleteLibrary,
        onDeleteFile
    }: {
        item: Library | Snippet;
        type: ExplorerItemType;
        level?: number;
        selectedItem: Library | Snippet | null | undefined;
        creatingFolder?: (creating: boolean) => void;
        creatingFile?: (creating: boolean) => void;
        isCreatingFolder?: boolean;
        isCreatingFile?: boolean;
        onSelect: (item: Library | Snippet) => void;
        onCreateFolder?: (title: string, parentId?: string) => void;
        onCancelFolderCreation?: () => void;
        onCreateFile?: (title: string, parentId?: string) => void;
        onCancelFileCreation?: () => void;
        onDeleteLibrary?: (libraryId: string) => void;
        onDeleteFile?: (fileId: string) => void;
    }
) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [childFolders, setChildFolders] = useState<Library[]>([]);
    const [childFiles, setChildFiles] = useState<Snippet[]>([]);

    const [loadingChildren, setLoadingChildren] = useState(false);

    const isSelected = selectedItem?.id == item.id;

    // // const fetchLibrarys = async (libraryId: string) => {
    // //     setLoadingChildren(true);
    // //     try {
    // //         const res = await fetch(`api/libraries/children`, {
    // //             method: "GET",
    // //             headers: {
    // //                 "x-library-id": libraryId
    // //             }
    // //         });
    // //         if (!res.ok) throw new Error("Failed to fetch child librarys");
    // //         const data: Library[] = await res.json();
    // //         setChildFolders(data);
    // //     } catch (error) {
    // //         console.log("Failed To Fetch Libraries: " + (error as Error).message);
    // //         setChildFolders([]);
    // //     } finally {
    // //         setLoadingChildren(false);
    // //     }
    // // }

    // useSSE<Library>({
    //     endpoint: isExpanded && type === ExplorerItemType.Folder
    //         ? `/api/libraries/children/subscribe?libraryId=${item.id}`
    //         : "",
    //     setState: setChildFolders,
    //     topLevelKey: "libraries"
    // });

    // // const fetchFiles = async (libraryId: string) => {
    // //     setLoadingChildren(true);
    // //     try {
    // //         const res = await fetch(`api/snippets/library`, {
    // //             method: "GET",
    // //             headers: {
    // //                 "x-library-id": libraryId
    // //             }
    // //         });
    // //         if (!res.ok) throw new Error("Failed to fetch child files");
    // //         const data: Snippet[] = await res.json();
    // //         setChildFiles(data);
    // //     } catch (error) {
    // //         console.log("Failed To Fetch Libraries: " + (error as Error).message);
    // //         setChildFiles([]);
    // //     } finally {
    // //         setLoadingChildren(false);
    // //     }
    // // }

    // useSSE<Snippet>({
    //     endpoint: isExpanded && type === ExplorerItemType.Folder
    //         ? `/api/snippets/children/subscribe?libraryId=${item.id}`
    //         : "",
    //     setState: setChildFiles,
    //     topLevelKey: "snippets"
    // });

    // useEffect(() => {
    //     if (isExpanded == true) {
    //         //fetchLibrarys(item.id);
    //         fetchFiles(item.id);
    //     }
    // }, [isExpanded]);

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
                        if (type === ExplorerItemType.Folder) {
                            setIsExpanded(!isExpanded);
                            creatingFolder?.(false);
                        }
                        // console.log("-0-01-203-123-1231231231231231231231231231231231231", {item})

                        onSelect(item);
                    }
                }

                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === ExplorerItemType.Folder && (
                    <BiChevronRight
                        className={`w-3 h-3 text-gray-400 transition-transform mr-1 ${isExpanded ? 'rotate-90' : ''
                            }`}

                    />
                )}

                {type === ExplorerItemType.Folder ? (
                    <BiFolder className="w-4 h-4 text-blue-500 mr-2" />
                ) : (
                    <BiFile className="w-4 h-4 text-gray-500 mr-2" />
                )}

                <span className="flex-1 text-sm truncate">
                    {type === ExplorerItemType.Folder
                        ? (item as Library).libraryname
                        : (item as Snippet).title
                    }
                </span>



                {isHovered && (
                    <div className="flex items-center gap-1 ml-2">
                        {type === ExplorerItemType.Folder && onCreateFolder && (
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

                        {/* {type === 'file' && onCreateFile && (
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
                        )} */}

                        {onDeleteLibrary && type === ExplorerItemType.Folder && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteLibrary(item.id);
                                }}
                                className="p-1 hover:bg-red-200 rounded"
                                title="Delete"
                            >
                                <BiTrash className="w-3 h-3 text-red-500" />
                            </button>
                        )}

                        {onDeleteFile && type === ExplorerItemType.File && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteFile(item.id);
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

            {type === ExplorerItemType.Folder && isExpanded && (
                <div>

                    {isCreatingFolder && isSelected &&
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.Folder}
                            parentId={item.id}
                            onConfirm={
                                onCreateFolder
                                    ? (title: string) => onCreateFolder(title, item.id)
                                    : () => { }
                            }
                            onCancel={onCancelFolderCreation ?? (onCancelFolderCreation ?? (() => { }))}

                        />
                    }

                    {isCreatingFile && isSelected &&
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.File}
                            parentId={item.id}
                            onConfirm={
                                onCreateFile
                                    ? (title: string) => onCreateFile(title, item.id)
                                    : () => { }
                            }
                            onCancel={onCancelFileCreation ?? (onCancelFileCreation ?? (() => { }))}

                        />
                    }

                    {childFolders && childFolders.map((lib) => (
                        <div key={lib.id} onClick={(e) => {
                            e.stopPropagation();
                            onSelect(lib);
                        }}>
                            <TreeItem
                                item={lib}
                                type={ExplorerItemType.Folder}
                                level={level + 1}
                                creatingFolder={creatingFolder}
                                isCreatingFolder={isCreatingFolder}
                                creatingFile={creatingFile}
                                isCreatingFile={isCreatingFile}
                                selectedItem={selectedItem}
                                onSelect={(lib) => {
                                    onSelect(lib);
                                }}
                                onCreateFolder={onCreateFolder}
                                onCancelFolderCreation={onCancelFolderCreation}
                                onCreateFile={onCreateFile}
                                onCancelFileCreation={onCancelFileCreation}
                                onDeleteLibrary={onDeleteLibrary}
                                onDeleteFile={onDeleteFile}
                            />
                        </div>
                    ))}

                    {childFiles && childFiles.map((file) => (
                        <div key={file.id} onClick={(e) => {
                            e.stopPropagation();
                            onSelect(file);
                        }}>
                            <TreeItem
                                item={file}
                                type={ExplorerItemType.File}
                                level={level + 1}
                                creatingFolder={creatingFolder}
                                selectedItem={selectedItem}
                                onSelect={(file) => {
                                    onSelect(file);
                                }}
                                onDeleteFile={onDeleteFile}

                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}