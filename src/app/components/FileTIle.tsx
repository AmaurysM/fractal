"use client";

import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Library, Snippet } from "../lib/types";
import { SnippetTile } from "./SnippetTIle";

export const FileTile = ({
  library,
  onSnippetSelected,
  selectedSnippet,
  step,
}: {
  library: Library;
  onSnippetSelected: (snippet: Snippet) => void;
  selectedSnippet?: Snippet;
  step?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [childLibs, setChildrenLibs] = useState<Library[]>([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const [isHovering, setIsHovering] = useState(false);
  const [hoveringChild, setHoveringChild] = useState(false);

  const fetchChildren = async (childId: string) => {
    setLoadingChildren(true);
    try {
      const res = await fetch(`api/libraries/children`, {
        method: "GET",
        headers: {
          "x-parent-id": childId,
        },
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
          "x-library-id": libraryId,
        },
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

  const showHoverEffect = isHovering && !hoveringChild;

  const stepLevel = step ?? 0;
  //const paddingLeft = `${stepLevel * 16}px`;

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoveringChild(false);
      }}
      
    >
      <div
        className={`bg-base-100 shadow-sm transition-all duration-200 ${
          showHoverEffect ? "bg-base-300" : ""
        }`}
      >
        <div
          className="card-body p-4 cursor-pointer hover:bg-base-200/50 transition-colors duration-150"
          onClick={() => setOpen(!open)}
          style={{paddingLeft: `${stepLevel * 16 +16}px`}}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base-content truncate text-sm">
                  {library.LibraryName}
                </h3>
                {totalItems > 0 && (
                  <p className="text-xs text-base-content/60 mt-0.5">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
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
          <div
            className="border-t border-base-300"
            onMouseEnter={() => setHoveringChild(true)}
            onMouseLeave={() => setHoveringChild(false)}
            //style={{paddingLeft: `${stepLevel * 16 +16}px`}}
          >
            <div className="bg-base-50">
              {(loadingChildren || loadingSnippets) && (
                <div className="flex items-center gap-2 py-3 text-base-content/60 text-xs">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>
                    {loadingChildren && loadingSnippets
                      ? "Loading content..."
                      : loadingChildren
                      ? "Loading folders..."
                      : "Loading snippets..."}
                  </span>
                </div>
              )}

              <div>
                {/* Child Libraries */}
                {childLibs.map((item) => (
                  <div key={item.Id}>
                    <FileTile
                      library={item}
                      onSnippetSelected={onSnippetSelected}
                      selectedSnippet={selectedSnippet}
                      step={stepLevel + 1}
                    />
                  </div>
                ))}

                {/* Snippets */}
                {snippets.map((item) => (
                  <div key={item.Id}>
                    <SnippetTile
                      snippet={item}
                      onSnippetSelect={onSnippetSelected}
                      selectedSnippet={selectedSnippet}
                      step={stepLevel + 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
