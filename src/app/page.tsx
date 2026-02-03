"use client"

import { useEffect, useState } from "react";
import { ExplorerItemType, Library, Snippet } from "../../types/types";
import { BiUser, BiCode } from "react-icons/bi";
import { VscNewFile, VscNewFolder, VscFiles, VscSearch } from "react-icons/vsc";
import { CodeDisplay } from "./components/CodeDisplay";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TreeItem } from "./components/TreeItem";
import { TreeItemCreation } from "./components/TreeItemCreation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { signOut } from "next-auth/react"
import { useAppStore } from "./store/useAppStore";
import { StatsFooterSkeleton, TreeSkeleton } from "./components/SkeletonLoading";

enum ActivityItem {
  Explorer = "Explorer",
  Search = "Search"
}

export default function Home() {
  const { data: session } = useSession();
  const [hoveringResizer, setHoveringResizer] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activity, setActivity] = useState<ActivityItem>(ActivityItem.Explorer);
  const [searchValue, setSearchValue] = useState<string>("");

  const {
    user,
    setUser,
    isHydrated,
    fetchLibraries,
    fetchSnippets,
    uiLibraries: libraries,
    uiParentLibraries: parentLibraries,
    uiSnippets: snippets,
    uiParentSnippets: parentSnippets,
    fetchParentSnippets,
    fetchParentLibraries,
    setIsAddingLibrary,
    setIsAddingSnippet,
    isFetchingParentLibraries,
    isAddingSnippet,
    isAddingLibrary,
    isFetchingParentSnippets,
    isFindingLibraries,
    isFindingSnippets,
    findLibraries,
    findSnippets,
    foundLibraries,
    foundSnippets,
    selectedSnippet,
    lastSelectedItem,
    setSelectedSnippet,
    setLastSelectedItem
  } = useAppStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    if (user === null && session?.user) {
      fetchUser();
    }
  }, [session, user, setUser]);

  const handleSidebarClick = () => {
    setLastSelectedItem(null);
    setIsAddingLibrary(false);
    setIsAddingSnippet(false);
  };

  useEffect(() => {
    if (user && isHydrated) {
      Promise.all([
        fetchLibraries(user.id),
        fetchSnippets(user.id),
        fetchParentLibraries(user.id),
        fetchParentSnippets(user.id),
      ]).catch(error => {
        console.error("Error fetching initial data:", error);
      });
    }
  }, [user, isHydrated, fetchLibraries, fetchSnippets, fetchParentLibraries, fetchParentSnippets]);

  const isInitialLoading = !user || !isHydrated;

  const isDataLoading = isHydrated && user &&
    (isFetchingParentLibraries || isFetchingParentSnippets) &&
    parentLibraries.length === 0 &&
    parentSnippets.length === 0;

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="h-[35px] bg-[#323233] border-b border-[#3e3e42] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="text-[13px] font-medium text-[#cccccc] tracking-tight">Voronoi</div>
          <div className="text-[11px] text-[#858585]">Code Library Manager</div>
        </div>
        <div className="flex items-center">
          {isInitialLoading ? (
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-5 h-5 rounded-full bg-[#505050] animate-pulse"></div>
              <div className="h-3 w-24 bg-[#505050] rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded-sm transition-colors">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-[#505050] flex items-center justify-center">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  ) : (
                    <BiUser className="w-3 h-3 text-[#cccccc]" />
                  )}
                </div>
                <span className="text-[11px] text-[#cccccc] max-w-[150px] truncate">{user?.email}</span>
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-1.5 text-[10px] text-[#858585] uppercase tracking-wider">Account</div>
                <div className="px-3 py-1.5 text-[12px] text-[#cccccc] truncate border-b border-[#3e3e42]">
                  {user?.email}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/landing" })}
                  className="w-full px-3 py-1.5 text-[12px] text-left text-[#f48771] hover:bg-[#f48771]/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1">
        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] border-r border-[#3e3e42] flex flex-col items-center py-2">
          <div className="flex flex-col gap-0.5 flex-1">
            <button
              onClick={() => setActivity(ActivityItem.Explorer)}
              className={`w-12 h-12 flex items-center justify-center transition-colors relative ${activity === ActivityItem.Explorer
                  ? 'text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-white'
                  : 'text-[#858585] hover:text-white'
                }`}
              title="Explorer"
              disabled={isInitialLoading}
            >
              <VscFiles className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivity(ActivityItem.Search)}
              className={`w-12 h-12 flex items-center justify-center transition-colors relative ${activity === ActivityItem.Search
                  ? 'text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-white'
                  : 'text-[#858585] hover:text-white'
                }`}
              title="Search"
              disabled={isInitialLoading}
            >
              <VscSearch className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <Panel defaultSize={20} minSize={15} maxSize={40} className="bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          {isInitialLoading ? (
            // Initial loading skeleton (before hydration)
            <>
              <div className="h-[35px] flex items-center justify-between px-3 border-b border-[#3e3e42]">
                <div className="h-3 w-16 bg-[#3e3e42] rounded animate-pulse"></div>
                <div className="flex items-center gap-1">
                  <div className="w-7 h-7 bg-[#3e3e42] rounded animate-pulse"></div>
                  <div className="w-7 h-7 bg-[#3e3e42] rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <TreeSkeleton count={6} />
              </div>
              <StatsFooterSkeleton />
            </>
          ) : activity === ActivityItem.Explorer ? (
            <>
              {/* Explorer Header */}
              <div className="h-[35px] flex items-center justify-between px-3 border-b border-[#3e3e42]">
                <h3 className="text-[11px] font-medium text-[#cccccc] uppercase tracking-wider">Explorer</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsAddingSnippet(true);
                      setIsAddingLibrary(false);
                    }}
                    className="p-1.5 rounded-sm hover:bg-[#2a2d2e] transition-colors text-[#cccccc]"
                    title="New File"
                  >
                    <VscNewFile className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingLibrary(true);
                      setIsAddingSnippet(false);
                    }}
                    className="p-1.5 rounded-sm hover:bg-[#2a2d2e] transition-colors text-[#cccccc]"
                    title="New Folder"
                  >
                    <VscNewFolder className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* File Tree */}
              <div className="flex-1 overflow-auto" onClick={handleSidebarClick}>
                {isDataLoading ? (
                  // Show skeleton only when initially loading with no cached data
                  <div className="p-2">
                    <TreeSkeleton count={6} />
                  </div>
                ) : (
                  <>
                    {isAddingLibrary && (
                      (lastSelectedItem === null ||
                        (selectedSnippet !== null && parentSnippets.some(snip => snip.id === selectedSnippet.id))
                      ) &&
                      !(lastSelectedItem && 'title' in lastSelectedItem && !('text' in lastSelectedItem)) && (
                        <TreeItemCreation
                          type={ExplorerItemType.Folder}
                          onSuccess={() => fetchParentLibraries(user.id)}
                        />
                      )
                    )}

                    {parentLibraries.length > 0 && (
                      <div>
                        {parentLibraries.map((lib) => (
                          <div
                            key={lib.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLastSelectedItem(lib);
                            }}
                          >
                            <TreeItem item={lib} type={ExplorerItemType.Folder} />
                          </div>
                        ))}
                      </div>
                    )}

                    {isAddingSnippet && (
                      (lastSelectedItem === null ||
                        (selectedSnippet !== null && parentSnippets.some(snip => snip.id === selectedSnippet.id))
                      ) &&
                      !(lastSelectedItem && 'title' in lastSelectedItem && !('text' in lastSelectedItem)) && (
                        <TreeItemCreation
                          type={ExplorerItemType.File}
                          onSuccess={() => fetchParentSnippets(user.id)}
                        />
                      )
                    )}

                    {parentSnippets.map((snip) => (
                      <div
                        key={snip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLastSelectedItem(snip);
                          setSelectedSnippet(snip);
                        }}
                      >
                        <TreeItem item={snip} type={ExplorerItemType.File} />
                      </div>
                    ))}

                    {!isDataLoading && libraries.length === 0 && parentSnippets.length === 0 && (
                      <div className="text-center py-12 px-4">
                        <p className="text-[#858585] text-[13px]">No files or folders</p>
                        <p className="text-[#6e6e6e] text-[11px] mt-1">Click the icons above to get started</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Stats Footer */}
              {isDataLoading ? (
                <StatsFooterSkeleton />
              ) : (
                <div className="border-t border-[#3e3e42] bg-[#2d2d30]">
                  <div className="grid grid-cols-2 divide-x divide-[#3e3e42]">
                    <div className="px-3 py-2">
                      <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-0.5">Libraries</div>
                      <div className="text-[13px] text-[#cccccc] font-medium">{libraries.length}</div>
                    </div>
                    <div className="px-3 py-2">
                      <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-0.5">Snippets</div>
                      <div className="text-[13px] text-[#cccccc] font-medium">{snippets.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Search View
            <div className="flex flex-col h-full">
              <div className="h-[35px] flex items-center px-3 border-b border-[#3e3e42]">
                <h3 className="text-[11px] font-medium text-[#cccccc] uppercase tracking-wider">Search</h3>
              </div>

              <div className="p-3">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    findLibraries(value);
                    findSnippets(value);
                  }}
                  className="w-full px-2 py-1.5 bg-[#3c3c3c] border border-[#3e3e42] text-[#cccccc] text-[13px] rounded-sm focus:outline-none focus:border-[#007acc] placeholder-[#6e6e6e]"
                  placeholder="Search files and folders..."
                />
              </div>

              <div className="flex-1 overflow-auto">
                {isFindingLibraries || isFindingSnippets ? (
                  <div className="p-2">
                    <TreeSkeleton count={4} />
                  </div>
                ) : (
                  <>
                    {foundLibraries.map((lib: Library) => (
                      <div
                        key={lib.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLastSelectedItem(lib);
                        }}
                      >
                        <TreeItem item={lib} type={ExplorerItemType.Folder} />
                      </div>
                    ))}

                    {foundSnippets.map((snip: Snippet) => (
                      <div
                        key={snip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLastSelectedItem(snip);
                          setSelectedSnippet(snip);
                        }}
                      >
                        <TreeItem item={snip} type={ExplorerItemType.File} />
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

              <div className="border-t border-[#3e3e42] bg-[#2d2d30]">
                <div className="grid grid-cols-2 divide-x divide-[#3e3e42]">
                  <div className="px-3 py-2">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-0.5">Libraries</div>
                    <div className="text-[13px] text-[#cccccc] font-medium">{foundLibraries.length}</div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-0.5">Snippets</div>
                    <div className="text-[13px] text-[#cccccc] font-medium">{foundSnippets.length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Panel>

        <PanelResizeHandle
          className={`transition-all duration-150 ${hoveringResizer || isDragging
              ? 'w-1 bg-[#007acc]'
              : 'w-px bg-[#3e3e42]'
            } cursor-col-resize`}
          onMouseEnter={() => setHoveringResizer(true)}
          onMouseLeave={() => setHoveringResizer(false)}
          onDragging={(isDragging) => setIsDragging(isDragging)}
        />

        {/* Main Content */}
        <Panel defaultSize={80} minSize={15} className="flex-1 flex flex-col bg-[#1e1e1e]">
          {selectedSnippet ? (
            <CodeDisplay />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-8">
                <BiCode className="w-20 h-20 text-[#3e3e42] mx-auto mb-6" />
                <h2 className="text-xl font-medium text-[#cccccc] mb-3">
                  Welcome to Fractal
                </h2>
                <p className="text-[#858585] text-sm leading-relaxed mb-6">
                  Your personal code library manager. Select a snippet from the sidebar to view and edit,
                  or organize your code into libraries for better management.
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-3 text-[#858585] text-sm">
                    <VscFiles className="w-4 h-4 flex-shrink-0" />
                    <span>Browse your libraries in the explorer</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#858585] text-sm">
                    <VscSearch className="w-4 h-4 flex-shrink-0" />
                    <span>Search across all your snippets</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#858585] text-sm">
                    <BiCode className="w-4 h-4 flex-shrink-0" />
                    <span>Click any snippet to view it here</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}