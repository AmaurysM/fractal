"use client"

import { useEffect, useState } from "react";
import { Library, Snippet, User } from "./lib/types";
import { BiUser, BiFolder, BiCode } from "react-icons/bi";
import { CodeDisplay } from "./components/CodeDisplay";
import { FileTile } from "./components/FileTIle";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AiFillFileAdd, AiFillFolderAdd } from "react-icons/ai";

export default function Home() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [librarys, setLibrarys] = useState<Library[]>([]);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingSnippets, setLoadingSnippets] = useState<boolean>(false);
  const [loadingLibrarys, setLoadingLibrarys] = useState<boolean>(false);
  const [selectedSnippet, SetSelectedSnippet] = useState<Snippet>();
  const [allLibraries, setAllLibraries] = useState<Library[]>([]);

  const fetchAllLibraries = async (userId: string) => {
    try {
      const res = await fetch(`api/libraries`, {
        method: "GET",
        headers: {
          "x-user-id": userId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch librarys");
      const data: Library[] = await res.json();
      setAllLibraries(data);
    } catch (error) {
      console.log("Failed To Fetch Libraries: " + (error as Error).message);
      setAllLibraries([]);
    }
  }

  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user');
      const data: User = await res.json();
      setUser(data);
    } catch (error) {
      console.log("Failed To Fetch User: " + (error as Error).message);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  const fetchSnippets = async (userId: string) => {
    setLoadingSnippets(true);
    try {
      const res = await fetch(`api/snippets`, {
        method: "GET",
        headers: {
          "x-user-id": userId
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

  const fetchLibrarys = async (userId: string) => {
    setLoadingLibrarys(true);
    try {
      const res = await fetch(`api/libraries/parents`, {
        method: "GET",
        headers: {
          "x-user-id": userId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch librarys");
      const data: Library[] = await res.json();
      setLibrarys(data);
    } catch (error) {
      console.log("Failed To Fetch Libraries: " + (error as Error).message);
      setLibrarys([]);
    } finally {
      setLoadingLibrarys(false);
    }
  }

  useEffect(() => {
    if (user == undefined) {
      fetchUser();
    } else if (user) {
      fetchAllLibraries(user.Id);
      fetchSnippets(user.Id);
      fetchLibrarys(user.Id);
    }
  }, [user]);

  const onAddFile = () => {

  }

  const onAddFolder = () => {
    
  }

  if (loadingUser && loadingSnippets) {
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

  if (user == null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-error">User Not Found</h2>
            <p className="text-base-content/70">We couldn&apos;t find your user account. Please try refreshing the page or contact support.</p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
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
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="avatar placeholder border-1 border-amber-100">
                <div className="bg-neutral text-neutral-content rounded w-10 p-2">
                  <BiUser className="w-5 h-5" />
                </div>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li className="menu-title">{user.Username}</li>
              <li><span className="text-xs text-base-content/70">{user.UserEmail}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <PanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <Panel defaultSize={20} minSize={20} maxSize={70} className="w-80 bg-base-100 border-r border-slate-200 flex flex-col overflow-auto">
          {/* User Info */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base-content truncate">{user.Username}</h2>
                <p className="text-sm text-base-content/70 truncate">{user.UserEmail}</p>
              </div>
            </div>
          </div>

          {/* Libraries Section */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-base-content">Libraries</h3>
                {loadingLibrarys && (
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                )}
                <div className="flex w-full items-end justify-end space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center" onClick={onAddFile}>
                    <AiFillFileAdd className="w-6 h-6 cursor-pointer hover:text-slate-400 transition-colors duration-200" />
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center" onClick={onAddFolder}>
                    <AiFillFolderAdd className="w-6 h-6 cursor-pointer hover:text-slate-400 transition-colors duration-200" />
                  </div>
                </div>
              </div>

              {loadingLibrarys ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-12 w-full"></div>
                  ))}
                </div>
              ) : librarys.length > 0 ? (
                <div className="space-y-2">
                  {librarys.map((lib) => (
                    <FileTile
                      key={lib.Id}
                      library={lib}
                      onSnippetSelected={SetSelectedSnippet}
                      selectedSnippet={selectedSnippet}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BiFolder className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/70 text-sm">No libraries found</p>
                  <p className="text-base-content/50 text-xs">Create your first library to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-t border-slate-200">
            <div className="stats stats-vertical shadow-sm bg-base-200 w-full">
              <div className="stat py-3">
                <div className="stat-title text-xs">Total Libraries</div>
                <div className="stat-value text-sm">{allLibraries.length}</div>
              </div>
              <div className="stat py-3">
                <div className="stat-title text-xs">Total Snippets</div>
                <div className="stat-value text-sm">{snippets.length}</div>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle
          className="w-0.5 bg-slate-300 cursor-col-resize transition-all duration-200 ease-in-out rounded hover:w-1.5 hover:bg-slate-400 hover:shadow"
        />
        {/* Main Content */}
        <Panel className="flex-1 flex flex-col">
          {selectedSnippet ? (
            <div className="flex-1 bg-base-100">
              <CodeDisplay snippet={selectedSnippet} />
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
    </div>
  );
}