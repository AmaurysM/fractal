"use client";

import { useState, useEffect, useRef } from "react";
import { BiFolder, BiFile, BiChevronRight } from "react-icons/bi";
import { ExplorerItemType } from "../../../types/types";
import { useAppStore } from "../store/useAppStore";

export const TreeItemCreation = ({
  level = 0,
  type = ExplorerItemType.Folder,
  parentId,
  onSuccess,
}: {
  level?: number;
  type?: ExplorerItemType;
  parentId?: string;
  onSuccess?: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    addSnippet, 
    addFolder, 
    cancelAddFolder, 
    cancelAddSnippet, 
    isAddingLibrary, 
    isAddingSnippet, 
    setIsAddingLibrary, 
    setIsAddingSnippet 
  } = useAppStore();

  const add = async (title: string): Promise<void> => {
    if (!title.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      if (type === ExplorerItemType.Folder) {
        await addFolder(title, parentId, onSuccess);
      } else {
        await addSnippet(title, parentId, onSuccess);
      }
    } catch (err) {
      setError((err as Error).message || "Failed to create");
      setIsCreating(false);
    }
  };

  const cancel = (): void => {
    if (isCreating) return; 
    
    if (type === ExplorerItemType.Folder) {
      cancelAddFolder();
    } else {
      cancelAddSnippet();
    }
  };

  const paddingLeft = level * 16 + 12;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCreating) return;

    if (e.key === "Enter" && title.trim() !== "") {
      add(title);
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur if there's content and not already creating
    if (title.trim() && !isCreating && !error) {
      add(title);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 transition-colors ${
          isHovered ? "bg-gray-700" : ""
        } ${isCreating ? "opacity-75" : ""}`}
        style={{ paddingLeft }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {type === ExplorerItemType.Folder && (
          <BiChevronRight
            className={`w-3 h-3 text-gray-400 transition-transform mr-1`}
          />
        )}

        {type === ExplorerItemType.Folder ? (
          <BiFolder className="w-4 h-4 text-blue-500 mr-2" />
        ) : (
          <BiFile className="w-4 h-4 text-gray-500 mr-2" />
        )}

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
          className={`flex-1 text-sm bg-transparent border-b focus:outline-none text-white placeholder-gray-400 ${
            error 
              ? "border-red-500" 
              : "border-gray-500 focus:border-blue-500"
          } ${isCreating ? "cursor-not-allowed" : ""}`}
          placeholder={type === ExplorerItemType.Folder ? "New folder" : "New file"}
        />

        {isCreating ?? (
          <div className="ml-2">
            <div className="w-4 h-4 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {error && (
        <div
          className="text-xs text-red-400 py-1 px-2 animate-fade-in"
          style={{ paddingLeft: paddingLeft + 24 }}
        >
          {error}
        </div>
      )}
    </div>
  );
};