"use client";

import { useState, useEffect, useRef } from "react";
import { BiFolder, BiChevronRight } from "react-icons/bi";
import { ExplorerItemType, Library, Snippet } from "../../../types/types";
import { AiOutlineFileText } from "react-icons/ai";
import { useLibrary } from "../hooks/useLibrary";
import { SnippetDTO } from "../api/snippets/parents/route";
import { LibraryDTO } from "../api/libraries/parents/route";
import { useSnippet } from "../hooks/useSnippet";

export const TreeItemEdit = ({
    level = 0,
    type = ExplorerItemType.Folder,
    item,
    onSuccess,
}: {
    level?: number;
    type?: ExplorerItemType;
    item: LibraryDTO | SnippetDTO;
    onSuccess?: () => void;
}) => {

    const { title: editingTitle, id: itemId } = item;
    const [title, setTitle] = useState(editingTitle);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);


    const {
        editLibraryTitle,
        addController: addLibraryController
    } = useLibrary();

    const {
        editSnippetTitle,
        addController: addSnipController
    } = useSnippet();

    const isFolder = type === ExplorerItemType.Folder;
    const paddingLeft = level * 12;

    const edit = async (title: string) => {
        if (!title.trim()) {
            setError("Name cannot be empty");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            if (isFolder) {
                await editLibraryTitle(item.id, title);
            } else {
                await editSnippetTitle(item.id, title);
            }
            item.title = title;
            onSuccess?.();
        } catch (err) {
            setError((err as Error).message || "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const cancel = () => {
        if (isSaving) return;
        setError(null);
        isFolder ? addLibraryController.abort() : addSnipController.abort();
        onSuccess?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isSaving) return;
        if (e.key === "Enter") edit(title);
        if (e.key === "Escape") cancel();
    };

    const handleBlur = () => {
        if (title.trim() && !isEditing && !error) edit(title);
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
                    group flex items-center
                    transition-colors
                    ${isHovered ? "bg-gray-700" : ""}
                    ${isEditing ? "opacity-75" : ""}
                `}
                style={{ paddingLeft }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex w-9 justify-center items-center">
                    {isFolder ? (
                        <>
                            <BiChevronRight
                                className={`w-3 h-3 text-transparent transition-transform mr-0.5 shrink-0`}
                            />
                            <BiFolder className="w-4 h-4 mr-1.5 text-blue-500" />
                        </>
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
                    disabled={isEditing}
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
                        ${isEditing ? "cursor-not-allowed" : ""}
                    `}
                />

                {isSaving && (
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