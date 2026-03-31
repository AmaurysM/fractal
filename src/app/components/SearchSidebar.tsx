"use client"

import { useState } from "react";
import { ExplorerItemType, Library, Snippet } from "../../../types/types";
import { TreeItem } from "../components/TreeItem";
import { useSession } from "next-auth/react";
import { TreeSkeleton } from "../components/SkeletonLoading";
import { TreeItemEdit } from "../components/TreeItemEdit";
import { useLibraryStore } from "../store/libraryStore";
import { useLibrary } from "../hooks/useLibrary";
import { useSnippet } from "../hooks/useSnippet";
import { LibraryDTO } from "../api/libraries/parents/route";
import { SnippetDTO } from "../api/snippets/parents/route";

export const SearchSidebar = () => {
    const { data: session } = useSession();

    const {
        selectedItem,
        isEditingFolder,
        setIsEditingFolder,
        isEditingSnippet,
        setIsEditingSnippet,
    } = useLibraryStore();
    const { searchLibraries } = useLibrary();
    const { searchSnippets } = useSnippet();

    const [searchValue, setSearchValue] = useState("");

    const [foundLibraries, setFoundLibraries] = useState<LibraryDTO[]>([]);
    const [foundSnippets, setFoundSnippets] = useState<SnippetDTO[]>([]);
    const [isSearching, setIsSearching] = useState(false);


    const handleSearch = async (query: string) => {
        setSearchValue(query);
        if (!query.trim()) {
            setFoundLibraries([]);
            setFoundSnippets([]);
            return;
        }

        setIsSearching(true);
        try {
            const [libs, snips] = await Promise.all([
                searchLibraries(query),
                searchSnippets(query),
            ]);

            setFoundSnippets(snips ?? []);
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="h-8.75 flex items-center px-3 border-b border-[#3e3e42]">
                <h3 className="text-[11px] font-medium text-[#cccccc] uppercase tracking-wider">Search</h3>
            </div>

            <div className="p-3">
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#3c3c3c] border border-[#3e3e42] text-[#cccccc] text-[13px] rounded-xm focus:outline-none focus:border-[#007acc] placeholder-[#6e6e6e]"
                    placeholder="Search files and folders..."
                />
            </div>

            <div className="flex-1 overflow-auto">
                {isSearching ? (
                    <div className="p-2">
                        <TreeSkeleton count={4} />
                    </div>
                ) : (
                    <>
                        {foundLibraries.map((lib) => (
                            <div
                                key={lib.id}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isEditingFolder && selectedItem === lib.id ? (
                                    <TreeItemEdit
                                        type={ExplorerItemType.Folder}
                                        item={lib}
                                        onSuccess={() => {
                                            setIsEditingFolder(false);
                                            setFoundLibraries(prev => prev.map(l =>
                                                l.id === lib.id ? { ...l, title: lib.title } : l
                                            ));
                                        }}
                                    />
                                ) : (
                                    <TreeItem
                                        item={{ id: lib.id, userid: session?.user.id!, title: lib.title } as Library}
                                        type={ExplorerItemType.Folder}
                                    />
                                )}
                            </div>
                        ))}

                        {foundSnippets.map((snip) => (
                            <div
                                key={snip.id}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isEditingSnippet && selectedItem === snip.id ? (
                                    <TreeItemEdit
                                        type={ExplorerItemType.File}
                                        item={snip}
                                        onSuccess={() => {
                                            setIsEditingSnippet(false);
                                            setFoundSnippets(prev => prev.map(s =>
                                                s.id === snip.id ? { ...s, title: snip.title } : s
                                            ));
                                        }}
                                    />
                                ) : (
                                    <TreeItem
                                        item={{ id: snip.id, title: snip.title, userId: session?.user.id! } as Snippet}
                                        type={ExplorerItemType.File}
                                    />
                                )}
                            </div>
                        ))}

                        {searchValue && foundLibraries.length === 0 && foundSnippets.length === 0 && (
                            <div className="text-center py-12 px-4">
                                <p className="text-[#858585] text-[13px]">No results found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}