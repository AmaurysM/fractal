"use client";

import { useState, useEffect, useRef } from "react";
import { BiFolder } from "react-icons/bi";
import { ExplorerItemType } from "../../../types/types";
import { AiOutlineFileText } from "react-icons/ai";
import { LibraryDTO } from "../api/libraries/parents/route";
import { SnippetDTO } from "../api/snippets/parents/route";
import { useSnippet } from "../hooks/useSnippet";
import { useLibrary } from "../hooks/useLibrary";
import { useLibraryStore } from "../store/libraryStore";

export const TreeItemCreation = ({
    level = 0,
    type = ExplorerItemType.Folder,
    parentId,
    onSuccess,
}: {
    level?: number;
    type?: ExplorerItemType;
    parentId?: string;
    onSuccess?: (item: SnippetDTO | LibraryDTO) => void;
}) => {
    const [title, setTitle] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        addSnippet,
        addController: addSnipController
    } = useSnippet();

    const {
        addLibrary,
        addController: addLibraryController
    } = useLibrary();

    const {
        setAddingSnippet,
        setAddingLibrary
    } = useLibraryStore();

    const isFolder = type === ExplorerItemType.Folder;
    const paddingLeft = level * 16 + 6;

    const add = async (title: string) => {
        if (!title.trim()) {
            setError("Name cannot be empty");
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            let created: SnippetDTO | LibraryDTO | undefined;

            if (isFolder) {
                created = await addLibrary(title, parentId);
            } else {
                created = await addSnippet(title, parentId);
            }


            if (!created) throw new Error("Failed to create");

            setAddingLibrary(false);
            setAddingSnippet(false);
            onSuccess?.(created);
        } catch (err) {
            setError((err as Error).message || "Failed to create");
        } finally {
            setIsCreating(false);
        }
    };

    const cancel = () => {
        if (isCreating) return;

        isFolder ? addLibraryController.abort() : addSnipController.abort();
        setIsCreating(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isCreating) return;

        if (e.key === "Enter") add(title);
        if (e.key === "Escape") cancel();
    };

    const handleBlur = () => {
        if (title.trim() && !isCreating && !error) add(title);
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(null), 3000);
        return () => clearTimeout(t);
    }, [error]);

    return (
        <div>
            <div
                className={`
                    group flex items-center border-l-2  py-0
                    border-[#1D232A] transition-colors
                    ${isHovered ? "bg-gray-700 border-gray-700" : ""}
                    ${isCreating ? "opacity-75" : ""}
                `}
                style={{ paddingLeft }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex-none">
                    {isFolder ? (
                        <BiFolder className="w-4 h-4 mr-1.5 text-blue-500" />
                    ) : (
                        <AiOutlineFileText className="w-4 h-4 mr-1.5 text-gray-500" />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    disabled={isCreating}
                    placeholder={isFolder ? "New folder" : "New file"}
                    className={`
                        flex-1 text-sm bg-transparent text-white
                        border-b placeholder-gray-400 focus:outline-none
                        transition-transform duration-200 ease-out
                        origin-left
                        scale-x-[0.96]
                        group-hover:scale-x-100
                        focus:scale-x-100
                        ${error ? "border-red-500" : "border-gray-500 focus:border-blue-500"}
                        ${isCreating ? "cursor-not-allowed" : ""}
                    `}
                />

                {isCreating && (
                    <div className="flex-none ml-2 w-3 h-3 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
                )}
            </div>

            {error && (
                <div
                    className="text-xs text-red-400 py-1 px-2"
                    style={{ paddingLeft: paddingLeft + 24 }}
                >
                    {error}
                </div>
            )}
        </div>
    );
};