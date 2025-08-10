"use client";

import { useState, useEffect, useRef } from "react";
import { BiFolder, BiFile, BiCheck, BiX, BiChevronRight } from "react-icons/bi";

export const TreeItemCreation = ({
    level = 0,
    type = "folder",
    parentId,
    onConfirm,
    onCancel
}: {
    level?: number;
    type?: "folder" | "file";
    parentId?: string;
    onConfirm: (title: string, parentId?: string) => void;
    onCancel: () => void;
}) => {
    const [title, setTitle] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);



    const paddingLeft = level * 16 + 12;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && title.trim() !== "") {
            onConfirm(title, parentId);
        } else if (e.key === "Escape") {
            onCancel();
        }
    };

    return (
        <div>
            <div
                className={`flex items-center py-1 px-2 transition-colors ${isHovered ? "bg-gray-700" : ""
                    }`}
                style={{ paddingLeft }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

                {type === 'folder' && (
                    <BiChevronRight
                        className={`w-3 h-3 text-gray-400 transition-transform mr-1 ${false ? 'rotate-90' : ''
                            }`}

                    />
                )}


                {type === "folder" ? (
                    <BiFolder className="w-4 h-4 text-blue-500 mr-2" />
                ) : (
                    <BiFile className="w-4 h-4 text-gray-500 mr-2" />
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-sm bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder={type === "folder" ? "New folder" : "New file"}
                />

                {isHovered && (
                    <div className="flex items-center gap-1 ml-2">
                        <button
                            onClick={() => title.trim() && onConfirm(title.trim())}
                            className="p-1 hover:bg-green-200 rounded"
                            title="Confirm"
                        >
                            <BiCheck className="w-3 h-3 text-green-500" />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-1 hover:bg-red-200 rounded"
                            title="Cancel"
                        >
                            <BiX className="w-3 h-3 text-red-500" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
