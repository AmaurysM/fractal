"use client"

import { useEffect, useState } from "react";
import { ExplorerItemType, Library, Snippet } from "../../types/types";
import { BiUser, BiCode } from "react-icons/bi";
import { VscNewFile, VscNewFolder, VscFiles, VscSearch } from "react-icons/vsc";
import { CodeDisplay } from "./components/CodeDisplay";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TreeItem } from "./components/TreeItem";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { signOut } from "next-auth/react"
import { TreeSkeleton } from "./components/SkeletonLoading";
import { TreeItemEdit } from "./components/TreeItemEdit";
import { FileTree } from "./components/FileTree";
import { useLibraryStore } from "./store/libraryStore";
import { useTabStore } from "./store/tabStore";
import { useAuthStore } from "./store/authStore";
import { useLibrary } from "./hooks/useLibrary";
import { useSnippet } from "./hooks/useSnippet";
import { LibraryDTO } from "./api/libraries/parents/route";
import { SnippetDTO } from "./api/snippets/parents/route";

enum ActivityItem {
  Explorer = "Explorer",
  Search = "Search"
}

export default function Home() {
  const { data: session } = useSession();

  const { user, setUser } = useAuthStore();

  const {
    selectedItem,
    setAddingSnippet,
    setAddingLibrary,
    isEditingFolder,
    setIsEditingFolder,
    isEditingSnippet,
    setIsEditingSnippet,
  } = useLibraryStore();

  const { tabs } = useTabStore();

  const { searchLibraries } = useLibrary();
  const { searchSnippets } = useSnippet();

  const [hoveringResizer, setHoveringResizer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activity, setActivity] = useState<ActivityItem>(ActivityItem.Explorer);
  const [searchValue, setSearchValue] = useState("");

  const [foundLibraries, setFoundLibraries] = useState<LibraryDTO[]>([]);
  const [foundSnippets, setFoundSnippets] = useState<SnippetDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync session user into auth store
  useEffect(() => {
    if (session?.user && (!user || session.user.id !== user.id)) {
      setUser(session.user);
    }
  }, [session, user, setUser]);

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
      // searchLibraries returns string[] per the hook, so we need to handle that
      // If your search returns full DTOs update accordingly
      setFoundSnippets(snips ?? []);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const isInitialLoading = !user;

  function handleSignout() {
    signOut({ callbackUrl: "/landing" });
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="h-8.75 bg-[#323233] border-b border-[#3e3e42] flex items-center justify-between px-4">
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
                <span className="text-[11px] text-[#cccccc] max-w-37.5 truncate">{user?.email}</span>
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-1.5 text-[10px] text-[#858585] uppercase tracking-wider">Account</div>
                <div className="px-3 py-1.5 text-[12px] text-[#cccccc] truncate border-b border-[#3e3e42]">
                  {user?.email}
                </div>
                <button
                  onClick={handleSignout}
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
              className={`w-12 h-12 flex items-center justify-center transition-colors relative ${
                activity === ActivityItem.Explorer
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
              className={`w-12 h-12 flex items-center justify-center transition-colors relative ${
                activity === ActivityItem.Search
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
            <>
              <div className="h-8.75 flex items-center justify-between px-3 border-b border-[#3e3e42]">
                <div className="h-3 w-16 bg-[#3e3e42] rounded animate-pulse"></div>
                <div className="flex items-center gap-1">
                  <div className="w-7 h-7 bg-[#3e3e42] rounded animate-pulse"></div>
                  <div className="w-7 h-7 bg-[#3e3e42] rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <TreeSkeleton count={6} />
              </div>
            </>
          ) : activity === ActivityItem.Explorer ? (
            <>
              {/* Explorer Header */}
              <div className="h-8.75 flex items-center justify-between px-3 border-b border-[#3e3e42]">
                <h3 className="text-[11px] font-medium text-[#cccccc] uppercase tracking-wider">Explorer</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAddingSnippet(true)}
                    className="p-1.5 rounded-sm hover:bg-[#2a2d2e] transition-colors text-[#cccccc]"
                    title="New File"
                  >
                    <VscNewFile className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAddingLibrary(true)}
                    className="p-1.5 rounded-sm hover:bg-[#2a2d2e] transition-colors text-[#cccccc]"
                    title="New Folder"
                  >
                    <VscNewFolder className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <FileTree />
            </>
          ) : (
            // Search View
            <div className="flex flex-col h-full">
              <div className="h-8.75 flex items-center px-3 border-b border-[#3e3e42]">
                <h3 className="text-[11px] font-medium text-[#cccccc] uppercase tracking-wider">Search</h3>
              </div>

              <div className="p-3">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#3c3c3c] border border-[#3e3e42] text-[#cccccc] text-[13px] rounded-sm focus:outline-none focus:border-[#007acc] placeholder-[#6e6e6e]"
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
          )}
        </Panel>

        <PanelResizeHandle
          className={`transition-all duration-150 ${
            hoveringResizer || isDragging ? 'w-1 bg-[#007acc]' : 'w-px bg-[#3e3e42]'
          } cursor-col-resize`}
          onMouseEnter={() => setHoveringResizer(true)}
          onMouseLeave={() => setHoveringResizer(false)}
          onDragging={(isDragging) => setIsDragging(isDragging)}
        />

        {/* Main Content */}
        <Panel defaultSize={80} minSize={15} className="flex-1 flex flex-col bg-[#1e1e1e]">
          {tabs.length > 0 ? (
            <CodeDisplay />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-8">
                <BiCode className="w-20 h-20 text-[#3e3e42] mx-auto mb-6" />
                <h2 className="text-xl font-medium text-[#cccccc] mb-3">
                  Welcome to Voronoi
                </h2>
                <p className="text-[#858585] text-sm leading-relaxed mb-6">
                  Your personal code library manager. Select a snippet from the sidebar to view and edit,
                  or organize your code into libraries for better management.
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-3 text-[#858585] text-sm">
                    <VscFiles className="w-4 h-4 shrink-0" />
                    <span>Browse your libraries in the explorer</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#858585] text-sm">
                    <VscSearch className="w-4 h-4 shrink-0" />
                    <span>Search across all your snippets</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#858585] text-sm">
                    <BiCode className="w-4 h-4 shrink-0" />
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