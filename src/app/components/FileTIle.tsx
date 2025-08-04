"use client";

import {  useEffect, useState } from "react";
import { FaChevronRight, FaFolder, FaFolderOpen } from "react-icons/fa";
import { Library, Snippet } from "../lib/types";
import { SnippetTile } from "./SnippetTIle";

export const FileTile = ({
    library,
    onSnippetSelected,
    selectedSnippet
}: {
    library: Library;
    onSnippetSelected: (snippet: Snippet) => void;
    selectedSnippet?: Snippet;
}) => {
    const [open, setOpen] = useState(false);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [childLibs, setChildrenLibs] = useState<Library[]>([]);
    const [loadingSnippets, setLoadingSnippets] = useState(false);
    const [snippets, setSnippets] = useState<Snippet[]>([]);

    const fetchChildren = async (childId: string) => {
        setLoadingChildren(true);
        try {
            const res = await fetch(`api/librarys/children`, {
                method: "GET",
                headers: {
                    "x-parent-id": childId
                }
            });
            if (!res.ok) throw new Error("Failed to fetch libraries");
            const data: Library[] = await res.json();
            setChildrenLibs(data);
        } catch (error) {
            console.log("Failed To Fetch Libraries: " + (error as Error).message);
            setChildrenLibs([]);
        } finally {
            setLoadingChildren(false);
        }
    };

    const fetchSnippets = async (libraryId: string) => {
        setLoadingSnippets(true);
        try {
            const res = await fetch(`api/snippets/library`, {
                method: "GET",
                headers: {
                    "x-library-id": libraryId
                }
            });
            if (!res.ok) throw new Error("Failed to fetch snippets");
            const data: Snippet[] = await res.json();
            setSnippets(data);
        } catch (error) {
            console.log("Failed To Fetch Snippets: " + (error as Error).message);
            setSnippets([]);
        } finally {
            setLoadingSnippets(false);
        }
    };

    useEffect(() => {
        fetchChildren(library.Id);
        fetchSnippets(library.Id);
    }, [library]);

    const totalItems = childLibs.length + snippets.length;
    const isLoading = loadingChildren || loadingSnippets;

    return (
        <div className="mb-2">
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300">
                <div
                    className="card-body p-4 cursor-pointer hover:bg-base-200/50 transition-colors duration-150"
                    onClick={() => setOpen(!open)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="avatar placeholder">
                                <div className={`w-8 h-8 rounded-lg p-2 ${
                                    open ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
                                }`}>
                                    {open ? (
                                        <FaFolderOpen className="w-4 h-4" />
                                    ) : (
                                        <FaFolder className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base-content truncate text-sm">
                                    {library.LibraryName}
                                </h3>
                                {totalItems > 0 && (
                                    <p className="text-xs text-base-content/60 mt-0.5">
                                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isLoading && (
                                <span className="loading loading-spinner loading-xs text-primary"></span>
                            )}
                            <FaChevronRight
                                className={`w-3 h-3 text-base-content/40 transition-transform duration-200 ${
                                    open ? "rotate-90" : ""
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {open && (
                    <div className="border-t border-base-300">
                        <div className="p-4 bg-base-50">
                            {(loadingChildren || loadingSnippets) && (
                                <div className="flex items-center gap-2 py-3 text-base-content/60 text-xs">
                                    <span className="loading loading-spinner loading-xs"></span>
                                    <span>
                                        {loadingChildren && loadingSnippets 
                                            ? "Loading content..." 
                                            : loadingChildren 
                                            ? "Loading folders..." 
                                            : "Loading snippets..."
                                        }
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2">
                                {/* Child Libraries */}
                                {childLibs.map((item) => (
                                    <div key={item.Id} className="ml-4">
                                        <FileTile 
                                            library={item} 
                                            onSnippetSelected={onSnippetSelected}
                                            selectedSnippet={selectedSnippet}
                                        />
                                    </div>
                                ))}

                                {/* Snippets */}
                                {snippets.map((item) => (
                                    <div key={item.Id} className="ml-4">
                                        <SnippetTile 
                                            snippet={item} 
                                            onSnippetSelect={onSnippetSelected} 
                                            selectedSnippet={selectedSnippet}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {!isLoading && totalItems === 0 && (
                                <div className="text-center py-6">
                                    <div className="avatar placeholder mb-3">
                                        <div className="bg-base-200 text-base-content/30 rounded-full w-12">
                                            <FaFolder className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-base-content/60 text-xs">
                                        This library is empty
                                    </p>
                                    <p className="text-base-content/40 text-xs mt-1">
                                        Add some snippets to get started
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};