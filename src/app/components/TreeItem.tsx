"use client"

import { useEffect, useState, useRef } from "react";
import { Library, Snippet, ExplorerItemType } from "../../../types/types";
import { BiChevronRight, BiFolder, BiTrash } from "react-icons/bi";
import { VscNewFolder, VscNewFile } from "react-icons/vsc";
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiC, SiKotlin, SiHtml5, SiCss3, SiJson, SiPhp, SiGo, SiRust } from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { TbBrandCSharp } from "react-icons/tb";

import { AiOutlineFileText } from "react-icons/ai";
import { TreeItemCreation } from "./TreeItemCreation";
import { useAppStore } from "../store/useAppStore";

const LANGUAGE_CONFIG = [
  { value: "", icon: AiOutlineFileText, ext: "txt", color: "#858585" },
  { value: "JavaScript", icon: SiJavascript, ext: "js", color: "#f7df1e" },
  { value: "TypeScript", icon: SiTypescript, ext: "ts", color: "#3178c6" },
  { value: "Python", icon: SiPython, ext: "py", color: "#3776ab" },
  { value: "Java", icon: FaJava, ext: "java", color: "#007396" },
  { value: "C++", icon: SiCplusplus, ext: "cpp", color: "#00599c" },
  { value: "C#", icon: TbBrandCSharp , ext: "cs", color: "#239120" },
  { value: "C", icon: SiC, ext: "c", color: "#a8b9cc" },
  { value: "Kotlin", icon: SiKotlin, ext: "kt", color: "#7f52ff" },
  { value: "Node.js", icon: SiJavascript, ext: "js", color: "#339933" },
  { value: "HTML", icon: SiHtml5, ext: "html", color: "#e34c26" },
  { value: "CSS", icon: SiCss3, ext: "css", color: "#1572b6" },
  { value: "JSON", icon: SiJson, ext: "json", color: "#000000" },
  { value: "SQL", icon: AiOutlineFileText, ext: "sql", color: "#e38c00" },
  { value: "PHP", icon: SiPhp, ext: "php", color: "#777bb4" },
  { value: "Go", icon: SiGo, ext: "go", color: "#00add8" },
  { value: "Rust", icon: SiRust, ext: "rs", color: "#000000" },
];

const getLanguageConfig = (language?: string) => {
  return LANGUAGE_CONFIG.find(l => l.value === language) || LANGUAGE_CONFIG[0];
};

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
            className="fixed bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 min-w-[200px]"
            style={{ left: x, top: y }}
        >
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left transition-colors ${
                        item.danger
                            ? 'hover:bg-[#f48771]/20 text-[#f48771]'
                            : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                    }`}
                >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export const TreeItem = ({
    item,
    type,
    level = 0,
}: {
    item: Library | Snippet;
    type: ExplorerItemType;
    level?: number;
}) => {
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
    } = useAppStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [childFolders, setChildFolders] = useState<Library[]>();
    const [childFiles, setChildFiles] = useState<Snippet[]>();
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [shouldShowCreation, setShouldShowCreation] = useState(false);

    const isSelected = lastSelectedItem?.id === item.id;

    // Get language config for files
    const langConfig = type === ExplorerItemType.File 
        ? getLanguageConfig((item as Snippet).language) 
        : null;
    const FileIcon = langConfig?.icon || AiOutlineFileText;

    const fetchLibraries = async (libraryId: string) => {
        setLoadingChildren(true);
        try {
            const res = await fetch(`api/libraries/children`, {
                method: "GET",
                headers: {
                    "x-library-id": libraryId
                }
            });
            if (!res.ok) throw new Error("Failed to fetch child libraries");
            const data: Library[] = await res.json();
            setChildFolders(data);
        } catch (error) {
            console.log("Failed to fetch libraries: " + (error as Error).message);
            setChildFolders([]);
        } finally {
            setLoadingChildren(false);
        }
    };

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
            console.log("Failed to fetch snippets: " + (error as Error).message);
            setChildFiles([]);
        } finally {
            setLoadingChildren(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        if (isExpanded) {
            fetchLibraries(item.id);
            fetchSnippets(item.id);
        }
    }, [isExpanded, item.id, user]);

    useEffect(() => {
        if (!user) return;
        if ((isAddingLibrary || isAddingSnippet) && isSelected) {
            setIsExpanded(true);
        }
    }, [isAddingLibrary, isAddingSnippet, user, isSelected]);

    useEffect(() => {
        const checkIfShouldShowCreation = () => {
            if (!lastSelectedItem) {
                setShouldShowCreation(false);
                return;
            }

            if ('title' in lastSelectedItem && !('text' in lastSelectedItem)) {
                if (isSelected && type === ExplorerItemType.Folder) {
                    setShouldShowCreation(true);
                } else {
                    setShouldShowCreation(false);
                }
                return;
            }

            if ('text' in lastSelectedItem) {
                if (type === ExplorerItemType.Folder && childFiles?.some(f => f.id === lastSelectedItem.id)) {
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

    useEffect(() => {
        if (shouldShowCreation && type === ExplorerItemType.Folder) {
            setIsExpanded(true);
            if (!childFolders && !childFiles && !loadingChildren) {
                fetchLibraries(item.id);
                fetchSnippets(item.id);
            }
        }
    }, [shouldShowCreation, childFolders, childFiles, loadingChildren, item.id, type]);

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
                icon: <VscNewFolder className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item);
                    setIsAddingLibrary(true);
                    setIsExpanded(true);
                }
            });
            items.push({
                label: 'New File',
                icon: <VscNewFile className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item);
                    setIsAddingSnippet(true);
                    setIsExpanded(true);
                }
            });
        } else {
            items.push({
                label: 'New Folder',
                icon: <VscNewFolder className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item);
                    setIsAddingLibrary(true);
                }
            });
            items.push({
                label: 'New File',
                icon: <VscNewFile className="w-4 h-4" />,
                onClick: () => {
                    handleTreeItemSelect(item);
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

    const paddingLeft = level * 12 + 8;

    if (!user) return null;

    return (
        <div className={isDeleting ? 'opacity-40 pointer-events-none' : ''}>
            <div
                className={`flex items-center h-[22px] cursor-pointer transition-colors select-none ${
                    isSelected
                        ? 'bg-[#37373d]'
                        : isHovered
                        ? 'bg-[#2a2d2e]'
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
                        className={`w-3 h-3 text-[#cccccc] transition-transform mr-0.5 flex-shrink-0 ${
                            isExpanded ? 'rotate-90' : ''
                        } ${loadingChildren ? 'opacity-50' : ''}`}
                    />
                )}

                {type === ExplorerItemType.Folder ? (
                    <BiFolder className={`w-4 h-4 mr-1.5 flex-shrink-0 ${isExpanded ? 'text-[#dcb67a]' : 'text-[#dcb67a]'}`} />
                ) : (
                    <FileIcon 
                        className="w-4 h-4 mr-1.5 flex-shrink-0" 
                        style={{ color: langConfig?.color || '#cccccc' }}
                    />
                )}

                <span className="flex-1 text-[13px] truncate text-[#cccccc] font-normal">
                    {type === ExplorerItemType.Folder
                        ? (item as Library).title
                        : (item as Snippet).title}
                </span>

                {type === ExplorerItemType.File && (
                    <span className="text-[11px] text-[#858585] mr-2 flex-shrink-0">
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
                    {isAddingLibrary && shouldShowCreation && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.Folder}
                            parentId={item.id}
                            onSuccess={() => fetchLibraries(item.id)}
                        />
                    )}

                    {!loadingChildren && childFolders?.map((lib) => (
                        <div
                            key={lib.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleTreeItemSelect(lib);
                            }}
                        >
                            <TreeItem
                                item={lib}
                                type={ExplorerItemType.Folder}
                                level={level + 1}
                            />
                        </div>
                    ))}

                    {isAddingSnippet && shouldShowCreation && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.File}
                            parentId={item.id}
                            onSuccess={() => fetchSnippets(item.id)}
                        />
                    )}

                    {!loadingChildren && childFiles?.map((file) => (
                        <div
                            key={file.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleTreeItemSelect(file);
                            }}
                        >
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
};