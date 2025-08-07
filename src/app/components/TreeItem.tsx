"use client"

import { useState } from "react";
import { Library, Snippet } from "../lib/types";
import { BiChevronRight, BiFolder, BiFile, BiPlus, BiTrash } from "react-icons/bi";

export const TreeItem = (
    {
        item,
        type,
        level = 0,
        isSelected,
        onSelect,
        onCreateFolder,
        onCreateFile,
        onDelete,
        children
    }: {
        item: Library | Snippet;
        type: 'folder' | 'file';
        level?: number;
        isSelected: boolean;
        onSelect: () => void;
        onCreateFolder?: (parentId: string) => void;
        onCreateFile?: (parentId: string) => void;
        onDelete?: () => void;
        children?: React.ReactNode;
    }
) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
                        }
                        onSelect();
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
                                    onCreateFolder(item.Id);
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
                                    onDelete();
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

            {type === 'folder' && isExpanded && children}
        </div>
    );
}