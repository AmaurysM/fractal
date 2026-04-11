"use client"

import { useEffect, useState, useRef } from "react";
import { BiUser, BiCode } from "react-icons/bi";
import { VscFiles, VscSearch } from "react-icons/vsc";
import { CodeDisplay } from "./components/CodeDisplay";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react"
import { TreeSkeleton } from "./components/SkeletonLoading";
import { FileTree } from "./components/FileTree";
import { useAuthStore } from "./store/authStore";
import { SearchSidebar } from "./components/SearchSidebar";
import { SettingWindow } from "./components/SettingWindow";
import { useSettingsStore } from "./store/SettingsStore";
import { AccountSwitcher } from "./components/AccountSwitcher";
import { upsertSavedAccount } from "./store/saveAccountsStore";
import { getTabStore } from "./store/tabStore";

enum ActivityItem {
  Explorer = "Explorer",
  Search = "Search"
}

export default function Home() {
  const { data: session, status } = useSession();

  const useTabStore = getTabStore(session?.user?.id ?? "guest");
  const { user, setUser } = useAuthStore();
  const { tabs, closeAllTabs } = useTabStore();

  const [hoveringResizer, setHoveringResizer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activity, setActivity] = useState<ActivityItem>(ActivityItem.Explorer);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(65);
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(65);
  const isDraggingDrawer = useRef(false);

  const { settings } = useSettingsStore();
  const userSettings = settings?.user;

  useEffect(() => {
    if (session?.user && (!user || session.user.id !== user.id)) {
      setUser(session.user);

      upsertSavedAccount({
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name,
        image: session.user.image,
        provider: (session.user as any).provider ?? inferProvider(session.user.image),
      });
    }
  }, [session, user, setUser]);

  const isInitialLoading = !user;

  function handleSignout() {
    closeAllTabs();
    signOut({ callbackUrl: "/landing" });
  }

  function handleActivityChange(item: ActivityItem) {
    if (activity === item && drawerOpen) {
      setDrawerOpen(false);
    } else {
      setActivity(item);
      setDrawerOpen(true);
    }
  }

  function onDrawerHandlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    dragStartHeight.current = drawerHeight;
    isDraggingDrawer.current = false;
  }

  function onDrawerHandlePointerMove(e: React.PointerEvent) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - e.clientY;
    if (Math.abs(delta) > 3) isDraggingDrawer.current = true;
    const screenH = window.innerHeight;
    const newHeight = Math.min(92, Math.max(15, dragStartHeight.current + (delta / screenH) * 100));
    setDrawerHeight(newHeight);
  }

  function onDrawerHandlePointerUp() {
    dragStartY.current = null;
    if (drawerHeight < 20) {
      setDrawerOpen(false);
      setDrawerHeight(65);
    } else if (drawerHeight > 80) {
      setDrawerHeight(90);
    }
    isDraggingDrawer.current = false;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">

        {/* ── Title bar ── */}
        <div className="h-8.75 bg-[#323233] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-[13px] font-medium text-[#cccccc] tracking-tight">Voronoi</div>
            <div className="text-[11px] text-[#858585] hidden sm:block">Code Library Manager</div>
          </div>

          {/* Account button — wraps AccountSwitcher */}
          <div className="flex items-center">
            {isInitialLoading ? (
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="w-5 h-5 rounded-full bg-[#505050] animate-pulse"></div>
                <div className="h-3 w-24 bg-[#505050] rounded animate-pulse hidden sm:block"></div>
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
                  <div className="text-[11px] text-[#cccccc] truncate max-w-30 hidden sm:block">
                    {userSettings?.username?.trim() ? userSettings.username : user?.email}
                  </div>
                </button>

                {/* Dropdown — now renders AccountSwitcher */}
                <AccountSwitcher
                  activeId={user?.id}
                  onSignOut={handleSignout}
                  onOpenSettings={() => setShowSettings(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop layout (sm+) ── */}
        <div className="hidden sm:flex flex-1 overflow-hidden">
          <PanelGroup direction="horizontal" className="flex-1">
            {/* Activity Bar */}
            <div className="w-12 bg-[#333333] border-r border-[#3e3e42] flex flex-col items-center py-2 shrink-0">
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
            <Panel defaultSize={20} minSize={15} maxSize={40} className="bg-[#252526] border-r border-[#3e3e42]">
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
                <FileTree />
              ) : (
                <SearchSidebar />
              )}
            </Panel>

            <PanelResizeHandle
              className={`transition-all duration-150 ${hoveringResizer || isDragging ? 'w-1 bg-[#007acc]' : 'w-px bg-[#3e3e42]'
                } cursor-col-resize`}
              onMouseEnter={() => setHoveringResizer(true)}
              onMouseLeave={() => setHoveringResizer(false)}
              onDragging={(d) => setIsDragging(d)}
            />

            {/* Main Content */}
            <Panel defaultSize={80} minSize={15} className="flex-1 flex flex-col bg-[#1e1e1e]">
              <DesktopMainContent tabs={tabs} />
            </Panel>
          </PanelGroup>
        </div>

        {/* ── Mobile layout ── */}
        <div className="flex sm:hidden flex-1 flex-col overflow-hidden relative">
          <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
            {tabs.length > 0 ? <CodeDisplay /> : <MobileEmptyState />}
          </div>

          {drawerOpen && (
            <div
              className="absolute inset-0 bg-black/40 z-20"
              onClick={() => setDrawerOpen(false)}
            />
          )}

          <div
            ref={drawerRef}
            className="absolute left-0 right-0 bottom-12 z-30 bg-[#252526] border-t border-[#3e3e42] rounded-t-xl flex flex-col will-change-transform"
            style={{
              height: `${drawerHeight}vh`,
              transform: drawerOpen ? 'translateY(0)' : 'translateY(110%)',
              transition: dragStartY.current !== null ? 'none' : 'transform 300ms ease-out',
            }}
          >
            <div
              className="flex justify-center items-center py-3 shrink-0 select-none touch-none group/handle"
              style={{ cursor: dragStartY.current !== null ? 'grabbing' : 'ns-resize' }}
              onPointerDown={onDrawerHandlePointerDown}
              onPointerMove={onDrawerHandlePointerMove}
              onPointerUp={onDrawerHandlePointerUp}
              onPointerCancel={onDrawerHandlePointerUp}
            >
              <div className="w-10 h-1 rounded-full bg-[#555555] group-hover/handle:bg-[#007acc] transition-colors duration-150" />
            </div>

            <div className="px-4 pb-2 shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-[#858585] uppercase tracking-wider font-medium">
                {activity === ActivityItem.Explorer ? 'Explorer' : 'Search'}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-[#858585] hover:text-[#cccccc] text-[18px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {isInitialLoading ? (
                <div className="p-3"><TreeSkeleton count={6} /></div>
              ) : activity === ActivityItem.Explorer ? (
                <FileTree />
              ) : (
                <SearchSidebar />
              )}
            </div>
          </div>

          <div className="h-12 bg-[#333333] border-t border-[#3e3e42] flex items-center shrink-0 z-40 relative">
            <button
              onClick={() => handleActivityChange(ActivityItem.Explorer)}
              disabled={isInitialLoading}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${activity === ActivityItem.Explorer && drawerOpen
                  ? 'text-white'
                  : 'text-[#858585] hover:text-[#cccccc]'
                }`}
            >
              <VscFiles className="w-5 h-5" />
              <span className="text-[9px] tracking-wide">Explorer</span>
            </button>
            <button
              onClick={() => handleActivityChange(ActivityItem.Search)}
              disabled={isInitialLoading}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${activity === ActivityItem.Search && drawerOpen
                  ? 'text-white'
                  : 'text-[#858585] hover:text-[#cccccc]'
                }`}
            >
              <VscSearch className="w-5 h-5" />
              <span className="text-[9px] tracking-wide">Search</span>
            </button>
          </div>
        </div>

      </div>

      {showSettings && <SettingWindow onClick={setShowSettings} />}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Best-effort inference of OAuth provider from the avatar URL.
 * NextAuth doesn't expose the provider in the session payload by default.
 * If you add `token.provider` in your JWT callback you can use that instead.
 */
function inferProvider(image?: string | null): string | null {
  if (!image) return null;
  if (image.includes("githubusercontent") || image.includes("avatars.githubusercontent")) return "github";
  if (image.includes("googleusercontent")) return "google";
  if (image.includes("cdn.discordapp")) return "discord";
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DesktopMainContent({ tabs }: { tabs: any[] }) {
  if (tabs.length > 0) return <CodeDisplay />;
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        <BiCode className="w-20 h-20 text-[#3e3e42] mx-auto mb-6" />
        <h2 className="text-xl font-medium text-[#cccccc] mb-3">Welcome to Voronoi</h2>
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
  );
}

function MobileEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <BiCode className="w-14 h-14 text-[#3e3e42] mx-auto mb-4" />
        <h2 className="text-base font-medium text-[#cccccc] mb-2">Welcome to Voronoi</h2>
        <p className="text-[#858585] text-xs leading-relaxed mb-5">
          Your personal code library manager. Open the explorer below to browse your snippets.
        </p>
        <div className="flex items-center justify-center gap-2 text-[#858585] text-xs">
          <VscFiles className="w-3.5 h-3.5" />
          <span>Tap Explorer to get started</span>
        </div>
      </div>
    </div>
  );
}