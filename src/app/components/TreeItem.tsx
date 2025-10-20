// "use client"

// import { useEffect, useState } from "react";
// import { Library, Snippet, ExplorerItemType } from "../../../types/types";
// import { BiChevronRight, BiFolder, BiFile, BiPlus, BiTrash } from "react-icons/bi";
// import { TreeItemCreation } from "./TreeItemCreation";
// import { useAppStore } from "../store/useAppStore";

// export const TreeItem = (
//     {
//         item,
//         type,
//         level = 0,
//     }: {
//         item: Library | Snippet;
//         type: ExplorerItemType;
//         level?: number;
//     }
// ) => {

//     const { user, deleteFolder, deleteSnippet, setIsAddingLibrary, isAddingLibrary, setIsAddingSnippet, isAddingSnippet, handleTreeItemSelect, lastSelectedItem, fetchParentLibraries, fetchParentSnippets } = useAppStore();

//     const [isExpanded, setIsExpanded] = useState(false);
//     const [isHovered, setIsHovered] = useState(false);
//     const [childFolders, setChildFolders] = useState<Library[]>();
//     const [childFiles, setChildFiles] = useState<Snippet[]>();

//     const [loadingChildren, setLoadingChildren] = useState(false);

//     const isSelected = lastSelectedItem?.id == item.id;

//     const fetchLibrarys = async (libraryId: string) => {
//         setLoadingChildren(true);
//         try {
//             const res = await fetch(`api/libraries/children`, {
//                 method: "GET",
//                 headers: {
//                     "x-library-id": libraryId
//                 }
//             });
//             if (!res.ok) throw new Error("Failed to fetch child librarys");
//             const data: Library[] = await res.json();
//             setChildFolders(data);
//         } catch (error) {
//             console.log("Failed To Fetch Libraries: " + (error as Error).message);
//             setChildFolders([]);
//         } finally {
//             setLoadingChildren(false);
//         }
//     }

//     const fetchSnippets = async (libraryId: string) => {
//         setLoadingChildren(true);
//         try {
//             const res = await fetch(`api/snippets/library`, {
//                 method: "GET",
//                 headers: {
//                     "x-library-id": libraryId
//                 }
//             });
//             if (!res.ok) throw new Error("Failed to fetch child files");
//             const data: Snippet[] = await res.json();
//             setChildFiles(data);
//         } catch (error) {
//             console.log("Failed To Fetch Libraries: " + (error as Error).message);
//             setChildFiles([]);
//         } finally {
//             setLoadingChildren(false);
//         }
//     }

//     useEffect(() => {
//         if (!user) return;
//         if (isExpanded == true) {
//             fetchLibrarys(item.id)
//             fetchSnippets(item.id)
//         }
//     }, [isExpanded]);

//     const paddingLeft = level * 16 + 12;

//     if (!user) return;

//     return (
//         <div>
//             <div
//                 className={`flex items-center py-1 px-2 cursor-pointer transition-colors ${isSelected
//                     ? 'bg-gray-700 border-l-2 px-1 py-0 border-blue-500'
//                     : isHovered
//                         ? 'bg-gray-700'
//                         : ''
//                     }`}
//                 style={{ paddingLeft }}
//                 onClick={
//                     () => {
//                         if (type === ExplorerItemType.Folder) {
//                             setIsExpanded(!isExpanded);
//                             setIsAddingLibrary(false);
//                         }

//                         handleTreeItemSelect(item);
//                     }
//                 }

//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//             >
//                 {type === ExplorerItemType.Folder && (
//                     <BiChevronRight
//                         className={`w-3 h-3 text-gray-400 transition-transform mr-1 ${isExpanded ? 'rotate-90' : ''
//                             }`}

//                     />
//                 )}

//                 {type === ExplorerItemType.Folder ? (
//                     <BiFolder className="w-4 h-4 text-blue-500 mr-2" />
//                 ) : (
//                     <BiFile className="w-4 h-4 text-gray-500 mr-2" />
//                 )}

//                 <span className="flex-1 text-sm truncate">
//                     {type === ExplorerItemType.Folder
//                         ? (item as Library).title
//                         : (item as Snippet).title
//                     }
//                 </span>



//                 {isHovered && (
//                     <div className="flex items-center gap-1 ml-2">
//                         {type === ExplorerItemType.Folder && (
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     setIsAddingLibrary(true);
//                                     setIsExpanded(true);

//                                 }}
//                                 className="p-1 hover:bg-blue-200 rounded"
//                                 title="New folder"
//                             >
//                                 <BiFolder className="w-3 h-3" />
//                             </button>
//                         )}

//                         {type === ExplorerItemType.Folder && (
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     deleteFolder(item.id);
//                                 }}
//                                 className="p-1 hover:bg-red-200 rounded"
//                                 title="Delete"
//                             >
//                                 <BiTrash className="w-3 h-3 text-red-500" />
//                             </button>
//                         )}

//                         {type === ExplorerItemType.File && (
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     deleteSnippet(item.id);
//                                 }}
//                                 className="p-1 hover:bg-red-200 rounded"
//                                 title="Delete"
//                             >
//                                 <BiTrash className="w-3 h-3 text-red-500" />
//                             </button>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {type === ExplorerItemType.Folder && isExpanded && (
//                 <div>

//                     {isAddingLibrary && isSelected &&
//                         <TreeItemCreation
//                             level={level + 1}
//                             type={ExplorerItemType.Folder}
//                             parentId={item.id}
//                             onSuccess={() => fetchLibrarys(item.id)}
//                         />
//                     }

//                     {isAddingSnippet && isSelected &&
//                         <TreeItemCreation
//                             level={level + 1}
//                             type={ExplorerItemType.File}
//                             parentId={item.id}
//                             onSuccess={() => fetchSnippets(item.id)}
//                         />
//                     }

//                     {childFolders && childFolders.map((lib) => (
//                         <div key={lib.id} onClick={(e) => {
//                             e.stopPropagation();
//                             handleTreeItemSelect(lib);
//                         }}>
//                             <TreeItem
//                                 item={lib}
//                                 type={ExplorerItemType.Folder}
//                                 level={level + 1}
//                             />
//                         </div>
//                     ))}

//                     {childFiles && childFiles.map((file) => (
//                         <div key={file.id} onClick={(e) => {
//                             e.stopPropagation();
//                             handleTreeItemSelect(file);
//                         }}>
//                             <TreeItem
//                                 item={file}
//                                 type={ExplorerItemType.File}
//                                 level={level + 1}
//                             />
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

"use client"

import { useEffect, useState, useRef } from "react";
import { Library, Snippet, ExplorerItemType } from "../../../types/types";
import { BiChevronRight, BiFolder, BiFile, BiPlus, BiTrash } from "react-icons/bi";
import { TreeItemCreation } from "./TreeItemCreation";
import { useAppStore } from "../store/useAppStore";

// Context Menu Component
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
            className="fixed bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50 min-w-[180px]"
            style={{ left: x, top: y }}
        >
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                        item.danger 
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

// Loading Skeleton
const LoadingSkeleton = ({ level }: { level: number }) => {
    const paddingLeft = level * 16 + 12;
    
    return (
        <div
            className="flex items-center py-1 px-2 animate-pulse"
            style={{ paddingLeft }}
        >
            <div className="w-3 h-3 bg-gray-700 rounded mr-1" />
            <div className="w-4 h-4 bg-gray-700 rounded mr-2" />
            <div className="flex-1 h-4 bg-gray-700 rounded max-w-[120px]" />
        </div>
    );
};

export const TreeItem = (
    {
        item,
        type,
        level = 0,
    }: {
        item: Library | Snippet;
        type: ExplorerItemType;
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
        fetchParentSnippets 
    } = useAppStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [childFolders, setChildFolders] = useState<Library[]>();
    const [childFiles, setChildFiles] = useState<Snippet[]>();
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isSelected = lastSelectedItem?.id == item.id;

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
            fetchLibrarys(item.id)
            fetchSnippets(item.id)
        }
    }, [isExpanded]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (type === ExplorerItemType.Folder) {
                await deleteFolder(item.id);
            } else {
                await deleteSnippet(item.id);
            }
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
                    setIsAddingLibrary(true);
                    setIsExpanded(true);
                }
            });
            items.push({
                label: 'New Snippet',
                icon: <BiFile className="w-4 h-4" />,
                onClick: () => {
                    setIsAddingSnippet(true);
                    setIsExpanded(true);
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
                className={`flex items-center py-1 px-2 cursor-pointer transition-colors ${
                    isSelected
                        ? 'bg-gray-700 border-l-2 px-1 py-0 border-blue-500'
                        : isHovered
                            ? 'bg-gray-700'
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
                        className={`w-3 h-3 text-gray-400 transition-transform mr-1 ${
                            isExpanded ? 'rotate-90' : ''
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
                    {isAddingLibrary && isSelected &&
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.Folder}
                            parentId={item.id}
                            onSuccess={() => fetchLibrarys(item.id)}
                        />
                    }

                    {isAddingSnippet && isSelected &&
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.File}
                            parentId={item.id}
                            onSuccess={() => fetchSnippets(item.id)}
                        />
                    }

                    {/* {loadingChildren && (
                        <>
                            <LoadingSkeleton level={level + 1} />
                            <LoadingSkeleton level={level + 1} />
                        </>
                    )} */}

                    {!loadingChildren && childFolders && childFolders.map((lib) => (
                        <div key={lib.id} onClick={(e) => {
                            e.stopPropagation();
                            handleTreeItemSelect(lib);
                        }}>
                            <TreeItem
                                item={lib}
                                type={ExplorerItemType.Folder}
                                level={level + 1}
                            />
                        </div>
                    ))}

                    {!loadingChildren && childFiles && childFiles.map((file) => (
                        <div key={file.id} onClick={(e) => {
                            e.stopPropagation();
                            handleTreeItemSelect(file);
                        }}>
                            <TreeItem
                                item={file}
                                type={ExplorerItemType.File}
                                level={level + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}