"use client";

import { useState, useEffect, useRef } from "react";
import { BiFolder } from "react-icons/bi";
import { ExplorerItemType } from "../../../types/types";
import { useAppStore } from "../store/useAppStore";
import { AiOutlineFileText } from "react-icons/ai";

export const TreeItemEdit = ({
    level = 0,
    editingTitle = "",
    type = ExplorerItemType.Folder,
    itemId,
    onSuccess,
}: {
    level?: number;
    editingTitle?: string;
    type?: ExplorerItemType;
    itemId: string;
    onSuccess?: () => void;
}) => {
    const [title, setTitle] = useState(editingTitle);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        editFolder,
        editSnippet,
        cancelEditFolder,
        cancelEditSnippet,
    } = useAppStore();

    const isFolder = type === ExplorerItemType.Folder;
    const paddingLeft = level * 16 + 6;

    const edit = async (title: string) => {
        if (!title.trim()) {
            setError("Name cannot be empty");
            return;
        }

        setIsEditing(true);
        setError(null);

        try {
            if (isFolder) {
                await editFolder(title, itemId, onSuccess);
            } else {
                await editSnippet(title, itemId, onSuccess);
            }
        } catch (err) {
            setError((err as Error).message || "Failed to create");
            setIsEditing(false);
        }
    };

    const cancel = () => {
        if (isEditing) return;

        isFolder ? cancelEditFolder() : cancelEditSnippet();
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isEditing) return;

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
                    group flex items-center border-l-2 py-0
                    border-[#1D232A] transition-colors
                    ${isHovered ? "bg-gray-700 border-gray-700" : ""}
                    ${isEditing ? "opacity-75" : ""}
                `}
                style={{ paddingLeft }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* ICON — fixed, never stretches */}
                <div className="flex-none">
                    {isFolder ? (
                        <BiFolder className="w-4 h-4 mr-1.5 text-blue-500" />
                    ) : (
                        <AiOutlineFileText className="w-4 h-4 mr-1.5 text-gray-500" />
                    )}
                </div>

                {/* INPUT — does the squash/stretch */}
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

                {isEditing && (
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