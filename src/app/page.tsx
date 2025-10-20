"use client"

import { useEffect, useState } from "react";
import { ExplorerItemType, Library, Snippet, User } from "../../types/types";
import { BiUser, BiFolder, BiCode } from "react-icons/bi";
import { CodeDisplay } from "./components/CodeDisplay";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AiFillFileAdd, AiFillFolderAdd } from "react-icons/ai";
import { TreeItem } from "./components/TreeItem";
import { TreeItemCreation } from "./components/TreeItemCreation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { signOut } from "next-auth/react"
import { LuFiles, LuSearch, LuSettings } from "react-icons/lu";
import { useAppStore } from "./store/useAppStore";

enum ActivityItem {
  Explorer = "Explorer",
  Search = "Search"
}

export default function Home() {
  const { data: session } = useSession();
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [hoveringResizer, setHoveringResizer] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activity, setActivity] = useState<ActivityItem>(ActivityItem.Explorer);
  const [searchValue, setSearchValue] = useState<string>("");

  const { user,
    setUser,
    saveSnippet,
    fetchLibraries,
    fetchSnippets,
    libraries,
    parentLibraries,
    snippets,
    parentSnippets,
    fetchParentSnippets,
    fetchParentLibraries,
    setIsAddingLibrary,
    setIsAddingSnippet,
    isFetchingLibraries,
    isAddingSnippet,
    isAddingLibrary,
    isFetchingParentLibraries,
    isFetchingParentSnippets,
    isFetchingSnippets, findLibraries,
    findSnippets,
    foundLibraries,
    foundSnippets,
    handleTreeItemSelect,
    selectedSnippet,
    lastSelectedItem,
    setSelectedSnippet,
    setLastSelectedItem
  } = useAppStore();

  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };


  const handleSidebarClick = () => {
    setLastSelectedItem(null);
    setIsAddingLibrary(false);
    setIsAddingSnippet(false);
  };

  useEffect(() => {
    if (user === null) {
      fetchUser();
    } else if (user) {
      Promise.all([
        fetchLibraries(user.id),
        fetchSnippets(user.id),

        fetchParentLibraries(user.id),
        fetchParentSnippets(user.id),
      ]).catch(error => {
        console.error("Error fetching initial data:", error);
      });
    }
  }, [user]);

  // Loading state
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <h2 className="card-title mt-4">Loading your workspace...</h2>
            <p className="text-base-content/70">Please wait while we set up your environment</p>
          </div>
        </div>
      </div>
    );
  }

  // User not found state
  if (user === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-error">User Not Found</h2>
            <p className="text-base-content/70">
              We couldn&apos;t find your user account. Please try refreshing the page or contact support.
            </p>
            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm border-b border-slate-200">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl font-bold text-base-content">Fractal</div>
              <div className="text-sm text-base-content/70">Manage your code library</div>
            </div>
          </div>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="avatar">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden border border-amber-100  bg-neutral text-neutral-content">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="Profile image"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <BiUser className="w-6 h-6 text-base-content/70 block mx-auto my-auto mt-2" />
                )}
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-lg bg-base-100 rounded-xl w-56 space-y-2"
            >
              <li className="menu-title text-xs text-base-content/60">
                Signed in as
              </li>
              <li>
                <span className="truncate font-medium text-base-content">
                  {user?.email || "Unknown User"}
                </span>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/landing" })}
                  className="text-error hover:bg-error hover:text-error-content rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>



      <PanelGroup direction="horizontal" className="h-full">
        {/* Activity bar*/}
        <div className="h-full w-12 bg-base-100 border-r border-slate-200 flex flex-col justify-between place-items-center  text-2xl">
          <div className="flex flex-col">
            <div className={`p-3 ${activity === ActivityItem.Explorer ? "text-blue-300 border-l-2 border-blue-300" : " border-l-2 border-base-100 hover:text-blue-300"}`}
              onClick={() => { setActivity(ActivityItem.Explorer) }}>
              <LuFiles />
            </div>
            <div className={`p-3 ${activity === ActivityItem.Search ? "text-blue-300 border-l-2 border-blue-300" : " border-l-2 border-base-100 hover:text-blue-300"}`}
              onClick={() => { setActivity(ActivityItem.Search) }}>
              <LuSearch />
            </div>
          </div>
          <div className="p-3 hover:text-blue-300">
            <LuSettings />
          </div>

        </div>
        {/* Sidebar */}
        <Panel
          defaultSize={30}
          minSize={20}
          maxSize={80}
          className="w-80 bg-base-100 border-r border-slate-200 flex flex-col overflow-auto justify-end"
        >
          {activity === ActivityItem.Explorer && (
            <>
              {/* Explorer Header */}
              <div className="flex items-center gap-2 px-4 py-[15px] border-b border-slate-100">
                <h3 className="font-medium text-base-content text-sm uppercase tracking-wide">Explorer</h3>
                {/* {isFetchingLibraries && (
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                )} */}
                <div className="flex ml-auto items-center gap-1">
                  <button
                    onClick={() => {
                      setIsAddingSnippet(!isAddingSnippet);
                      setIsAddingLibrary(false);
                    }}
                    className="p-1 rounded hover:bg-slate-200/60 transition-colors duration-150 group"
                    title="New File"
                  >
                    <AiFillFileAdd className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingLibrary(!isAddingLibrary);
                      setIsAddingSnippet(false);
                    }}
                    className="p-1 rounded hover:bg-slate-200/60 transition-colors duration-150 group"
                    title="New Folder"
                  >
                    <AiFillFolderAdd className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                  </button>
                </div>
              </div>

              {/* Libraries Section */}
              <div className="flex-1 overflow-auto" onClick={handleSidebarClick}>
                {/* Root level folder creation */}
                {isAddingLibrary && lastSelectedItem === null && (
                  <TreeItemCreation
                    type={ExplorerItemType.Folder}
                    onSuccess={() => fetchParentLibraries(user.id)}
                  />
                )}

                {/* Root level file creation */}
                {isAddingSnippet && lastSelectedItem === null && (
                  <TreeItemCreation
                    type={ExplorerItemType.File}
                    onSuccess={() => fetchParentSnippets(user.id)}
                  />
                )}

                {/* Libraries */}
                {parentLibraries.length > 0 ? (
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
                ) : null}


                {/* Parent Snippets */}
                {parentSnippets.map((snip) => (
                  <div
                    key={snip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLastSelectedItem(snip);
                      setSelectedSnippet(snip);
                    }}
                  >
                    <TreeItem
                      item={snip}
                      type={ExplorerItemType.File}
                    />
                  </div>
                ))}

                {/* Empty state */}
                {!isFetchingLibraries && !isFetchingSnippets && libraries.length === 0 && parentSnippets.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <p className="text-slate-500 text-sm">No files or folders yet</p>
                    <p className="text-slate-400 text-xs mt-1">Click the icons above to create your first item</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activity === ActivityItem.Search && (
            <div className="flex flex-col h-full w-full">
              <div className="relative w-full p-2 pt-2.5 pb-2.5 border-b-1">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    findLibraries(value);
                    findSnippets(value);
                  }}
                  className="w-full p-1 border border-gray-300 bg-base-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Search"
                />
              </div>

              <div className=" flex flex-col ">
                {foundLibraries.length > 0 ? (
                  foundLibraries.map((lib: Library) => (
                    <div
                      key={lib.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLastSelectedItem(lib);
                      }}
                    >
                      <TreeItem
                        item={lib}
                        type={ExplorerItemType.Folder}
                      />
                    </div>
                  ))
                ) : (
                  <></>
                )}

                {foundSnippets.length > 0 ? (
                  foundSnippets.map((snip: Snippet) => (
                    <div
                      key={snip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLastSelectedItem(snip);
                      }}
                    >
                      <TreeItem
                        item={snip}
                        type={ExplorerItemType.File}
                      />
                    </div>
                  ))
                ) : (
                  <></>
                )}


              </div>
            </div>
          )}

          {/* Stats */}
          <div className="p-4 border-t border-slate-200">
            <div className="stats stats-vertical shadow-sm bg-base-200 w-full">
              <div className="stat py-3">
                <div className="stat-title text-xs">Total Libraries</div>
                <div className="stat-value text-sm">{activity === ActivityItem.Explorer ? libraries.length : (foundLibraries.length)}</div>
              </div>
              <div className="stat py-3">
                <div className="stat-title text-xs">Total Snippets</div>
                <div className="stat-value text-sm">{activity === ActivityItem.Explorer ? snippets.length : (foundSnippets.length)}</div>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle
          className={`transition-all duration-200 ease-in-out rounded ${(hoveringResizer || isDragging)
            ? 'w-1.5 bg-slate-400 shadow'
            : 'w-0.5 bg-slate-300'
            } cursor-col-resize`}
          onMouseEnter={() => setHoveringResizer(true)}
          onMouseLeave={() => setHoveringResizer(false)}
          onDragging={(isDragging) => setIsDragging(isDragging)}
        />

        {/* Main Content */}
        <Panel className="flex-1 flex flex-col">
          {selectedSnippet ? (
            <div className="flex-1 bg-base-100">
              <CodeDisplay snippet={selectedSnippet} onSave={saveSnippet} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-base-100">
              <div className="text-center max-w-md">
                <BiCode className="w-24 h-24 text-base-content/20 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-base-content mb-3">
                  Welcome to Your Code Library
                </h2>
                <p className="text-base-content/70 mb-6">
                  Select a snippet from the sidebar to view and edit your code.
                  Organize your snippets into libraries for better management.
                </p>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <BiFolder className="w-4 h-4" />
                    <span>Browse libraries on the left</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <BiCode className="w-4 h-4" />
                    <span>Click any snippet to view it here</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div >
  );
}