"use client"

import { useEffect, useState, useRef } from "react";
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
import { useTabStore } from "../store/tabStore";
import { getLanguageConfig, LANGUAGES } from "../../../types/languages";
import { ContextMenu } from "./ContextMenu";

export const TreeItem = ({
    item,
    type,
    level = 0,
    onDelete,
}: {
    item: Library | Snippet;
    type: ExplorerItemType;
    level?: number;
    onDelete?: (id: string) => void;
}) => {

    const {
        fetchParentLibraries,
        searchLibraries,
        addLibrary,
        deleteLibrary,
    } = useLibrary();

    const {
        fetchParentSnippets,
        fetchSnippet,
        deleteSnippet
    } = useSnippet();

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
    const [libraries, setLibraries] = useState<LibraryDTO[]>([]);
    const [snippets, setSnippets] = useState<SnippetDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<Library | Snippet>(item);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const isSelected = selectedItem === item.id;

    const langConfig = type === ExplorerItemType.File
        ? getLanguageConfig((currentItem as Snippet).language)
        : null;
    const FileIcon = langConfig?.icon || AiOutlineFileText;

    useEffect(() => {
        if (!session) return;

        const loadData = async () => {
            setLoading(true);

            try {
                if (type === ExplorerItemType.Folder && isExpanded) {
                    const [libs, snips] = await Promise.all([
                        fetchParentLibraries(currentItem.id),
                        fetchParentSnippets(currentItem.id),
                    ]);

                    if (libs) setLibraries(libs);
                    if (snips) setSnippets(snips);
                }

                if (type === ExplorerItemType.File) {
                    const updated = await fetchSnippet(currentItem.id);
                    if (updated) setCurrentItem(updated);
                }
            } catch (error) {
                console.error("Failed to load item:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isExpanded, type, currentItem.id, session]);

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
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    setAddingLibrary(true);
                    setIsExpanded(true);
                }
            });
            items.push({
                label: 'New File',
                icon: <VscNewFile className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.File);
                    setAddingSnippet(true);
                    setIsExpanded(true);
                }
            });
            items.push({
                label: 'Change Name',
                icon: <CgRename className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.Folder);
                    setIsEditingFolder(true);
                }

            });
        } else {
            items.push({
                label: 'Change Name',
                icon: <CgRename className="w-4 h-4" />,
                onClick: () => {
                    setSelectedItem(item.id, ExplorerItemType.File);
                    setIsEditingSnippet(true);
                }

            })

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
    function handleClick(item: string): void {

        setSelectedItem(item, type);

    }

    return (
        <div className={isDeleting ? 'opacity-40 pointer-events-none' : ''}>
            <div
                className={`flex items-center h-5.5 cursor-pointer transition-colors select-none ${isSelected
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
                        setAddingLibrary(false);
                    }

                    handleClick(currentItem.id);
                }}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === ExplorerItemType.Folder && (
                    <BiChevronRight
                        className={`w-3 h-3 text-[#cccccc] transition-transform mr-0.5 shrink-0 ${isExpanded ? 'rotate-90' : ''
                            } ${loadingChildren ? 'opacity-50' : ''}`}
                    />
                )}

                {type === ExplorerItemType.Folder ? (
                    <BiFolder className={`w-4 h-4 mr-1.5 shrink-0 ${isExpanded ? 'text-[#dcb67a]' : 'text-[#dcb67a]'}`} />
                ) : (
                    <FileIcon
                        className="w-4 h-4 mr-1.5 shrink-0"
                        style={{ color: langConfig?.color || '#cccccc' }}
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
                            onSuccess={(newItem) => {
                                setLibraries(prev => [...prev, newItem as LibraryDTO]);
                            }}
                        />
                    )}

                    {!loadingChildren && libraries?.map((lib) => (
                        <div
                            key={lib.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(lib.id);
                            }}
                        >
                            {isEditingFolder && selectedItem === lib.id ?
                                <TreeItemEdit
                                    level={level + 1}
                                    //editingTitle={lib.title}
                                    type={ExplorerItemType.Folder}
                                    //itemId={lib.id}
                                    item={lib}
                                    onSuccess={() => {
                                        setIsEditingFolder(false);
                                        //fetchLibraries(item.id);
                                        setLibraries(prev => prev.map(l =>
                                            l.id === lib.id ? { ...l, title: lib.title } : l
                                        ));
                                    }}
                                />
                                :
                                <TreeItem
                                    item={{
                                        id: lib.id,
                                        userid: session?.user.id!,
                                        title: lib.title,
                                    } as Library}
                                    type={ExplorerItemType.Folder}
                                    level={level + 1}
                                    onDelete={(id) => setLibraries(prev => prev.filter(l => l.id !== id))}

                                />
                            }

                        </div>
                    ))}

                    {addingSnippet && isSelected && (
                        <TreeItemCreation
                            level={level + 1}
                            type={ExplorerItemType.File}
                            parentId={item.id}
                            onSuccess={(newItem) => {
                                setSnippets(prev => [...prev, newItem as SnippetDTO]);
                            }}
                        />
                    )}

                    {!loadingChildren && snippets?.map((snip) => (
                        <div
                            key={snip.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(snip.id);
                            }}
                        >
                            {isEditingSnippet && selectedItem === snip.id ?
                                <TreeItemEdit
                                    level={level + 1}
                                    type={ExplorerItemType.File}
                                    item={snip}
                                    onSuccess={() => {
                                        setIsEditingSnippet(false);
                                        setSnippets(prev => prev.map(s =>
                                            s.id === snip.id ? { ...s, title: snip.title } : s
                                        ));
                                    }}
                                />
                                :
                                <TreeItem
                                    item={{
                                        id: snip.id,
                                        title: snip.title,
                                        userId: session?.user.id!
                                    } as Snippet}
                                    type={ExplorerItemType.File}
                                    level={level + 1}
                                    onDelete={(id) => setSnippets(prev => prev.filter(s => s.id !== id))}

                                />
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};