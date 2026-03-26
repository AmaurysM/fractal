"use client"

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { TreeSkeleton } from "./SkeletonLoading";
import { TreeItemCreation } from "./TreeItemCreation";
import { ActivityItem, ExplorerItemType, Snippet } from "../../../types/types";
import { useLibrary } from "../hooks/useLibrary";
import { useLibraryStore } from "../store/libraryStore";
import { TreeItem } from "./TreeItem";
import { TreeItemEdit } from "./TreeItemEdit";
import { Library } from "../../../types/types";
import { LibraryDTO } from "../api/libraries/parents/route";
import { useSnippet } from "../hooks/useSnippet";
import { SnippetDTO } from "../api/snippets/parents/route";

export const FileTree = () => {

    const {
        fetchParentLibraries
    } = useLibrary();

    const {
        fetchParentSnippets
    } = useSnippet();

    const {
        selectedItem,
        setSelectedItem,
        addingSnippet,
        addingLibrary,
        isEditingFolder,
        setIsEditingFolder,
        isEditingSnippet,
        setIsEditingSnippet,
    } = useLibraryStore();



    const { data: session } = useSession();
    const [libraries, setLibraries] = useState<LibraryDTO[]>([]);
    const [snippets, setSnippets] = useState<SnippetDTO[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const [hoveringResizer, setHoveringResizer] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activity, setActivity] = useState<ActivityItem>(ActivityItem.Explorer);
    const [searchValue, setSearchValue] = useState<string>("");
    const isSelected = selectedItem == null;


    useEffect(() => {
        const fetchLibraries = async () => {
            setLoading(true)
            try {
                const libs: LibraryDTO[] | undefined = await fetchParentLibraries();
                if (libs) setLibraries(libs);
            } catch (error) {
                console.error("Failed to fetch libraries:", error);
            } finally {
                setLoading(false)
            }
        };
        const fetchSnippets = async () => {
            setLoading(true)
            try {

                const snips: SnippetDTO[] | undefined = await fetchParentSnippets();
                if (snips) setSnippets(snips);
            } catch (error) {
                console.error("Failed to fetch libraries:", error);
            } finally {
                setLoading(false)
            }
            console.log(snippets)
        };

        if (session) {
            fetchLibraries();
            fetchSnippets();
        }
    }, [session]);

    function handleClick(): void {
        setSelectedItem(null);
    }

    return (
        <div className="flex-1 overflow-auto" onClick={() => handleClick()}>
            {loading ? (
                <div className="p-2">
                    <TreeSkeleton count={6} />
                </div>
            ) : (
                <>
                    {addingLibrary && isSelected && (
                        <TreeItemCreation
                            type={ExplorerItemType.Folder}
                            onSuccess={() => fetchParentLibraries()}
                        />
                    )}

                    {libraries.length > 0 && (
                        <div>
                            {libraries.map((lib) => (
                                <div
                                    key={lib.id}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isEditingFolder && selectedItem === lib.id ? (  // ← add
                                        <TreeItemEdit
                                            type={ExplorerItemType.Folder}
                                            item={lib}
                                            onSuccess={() => {
                                                setIsEditingFolder(false);
                                                setLibraries(prev => prev.map(l =>
                                                    l.id === lib.id ? { ...l, title: lib.title } : l
                                                ));
                                            }} />
                                    ) : (
                                        <TreeItem
                                            item={{
                                                id: lib.id,
                                                userid: session?.user.id!,
                                                title: lib.title,
                                            } as Library}
                                            type={ExplorerItemType.Folder}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {addingSnippet && isSelected && (
                        <TreeItemCreation
                            type={ExplorerItemType.File}
                            onSuccess={() => fetchParentSnippets()}
                        />
                    )}

                    {snippets.length > 0 && (
                        <div>
                            {snippets.map((snip) => (
                                <div
                                    key={snip.id}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isEditingSnippet && selectedItem === snip.id ? (  // ← add
                                        <TreeItemEdit
                                            type={ExplorerItemType.File}
                                            item={snip}
                                            onSuccess={() => {
                                                setIsEditingSnippet(false);
                                                setSnippets(prev => prev.map(s =>
                                                    s.id === snip.id ? { ...s, title: snip.title } : s
                                                ));
                                            }} />
                                    ) : (
                                        <TreeItem
                                            item={{
                                                id: snip.id,
                                                title: snip.title,
                                                userId: session?.user.id!
                                            } as Snippet}
                                            type={ExplorerItemType.File}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && libraries.length === 0 && snippets.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <p className="text-[#858585] text-[13px]">No files or folders</p>
                            <p className="text-[#6e6e6e] text-[11px] mt-1">Click the icons above to get started</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}