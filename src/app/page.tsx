"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { BiUser, BiCode } from "react-icons/bi";
import { VscFiles, VscSearch } from "react-icons/vsc";
import { CodeDisplay } from "./components/CodeDisplay";
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

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 600;
const SIDEBAR_DEFAULT = 260;
const SNAP_THRESHOLD = 80; // px — drag below this width to snap closed

enum ActivityItem {
  Explorer = "Explorer",
  Search = "Search"
}

export default function Home() {
  const { data: session, status } = useSession();

  const useTabStore = getTabStore(session?.user?.id ?? "guest");
  const { user, setUser } = useAuthStore();
  const { tabs } = useTabStore();

  const [activity, setActivity] = useState<ActivityItem>(ActivityItem.Explorer);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(65);

  // Sidebar resize/collapse state
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(SIDEBAR_DEFAULT);
  const lastOpenWidth = useRef(SIDEBAR_DEFAULT);

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

  // ── Sidebar resize handlers ────────────────────────────────────────────────

  const onResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = sidebarCollapsed ? 0 : sidebarWidth;
    setIsResizing(true);

    function onMouseMove(e: MouseEvent) {
      const delta = e.clientX - resizeStartX.current;
      const raw = resizeStartWidth.current + delta;

      if (raw < SNAP_THRESHOLD) {
        // Floor to snap threshold visually while dragging so it doesn't flicker to 0 mid-drag
        setSidebarWidth(SNAP_THRESHOLD);
      } else {
        const clamped = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, raw));
        setSidebarWidth(clamped);
        setSidebarCollapsed(false);
        lastOpenWidth.current = clamped;
      }
    }

    function onMouseUp(e: MouseEvent) {
      const delta = e.clientX - resizeStartX.current;
      const raw = resizeStartWidth.current + delta;

      if (raw < SNAP_THRESHOLD) {
        // Snap closed
        setSidebarCollapsed(true);
        setSidebarWidth(SIDEBAR_DEFAULT);
        lastOpenWidth.current = SIDEBAR_DEFAULT;
      }

      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [sidebarCollapsed, sidebarWidth]);

  function openSidebar(item: ActivityItem) {
    setActivity(item);
    setSidebarCollapsed(false);
    setSidebarWidth(lastOpenWidth.current);
  }

  function handleActivityBarClick(item: ActivityItem) {
    if (sidebarCollapsed) {
      openSidebar(item);
    } else if (activity === item) {
      lastOpenWidth.current = sidebarWidth;
      setSidebarCollapsed(true);
    } else {
      setActivity(item);
    }
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

  function handleSignout() {
    signOut({ callbackUrl: "/landing" });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const effectiveSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;

  return (
    <div
      className="h-screen w-screen flex flex-col bg-[#1e1e1e] overflow-hidden"
      style={{ cursor: isResizing ? "col-resize" : undefined }}
    >
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">

        {/* ── Title bar ── */}
        <div className="h-8.75 bg-[#323233] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-[13px] font-medium text-[#cccccc] tracking-tight">Voronoi</div>
            <div className="text-[11px] text-[#858585] hidden sm:block">Code Library Manager</div>
          </div>

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
                      <Image src={user.image} alt="Profile" width={20} height={20} className="object-cover" />
                    ) : (
                      <BiUser className="w-3 h-3 text-[#cccccc]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#cccccc] truncate max-w-30 hidden sm:block">
                    {userSettings?.username?.trim() ? userSettings.username : user?.email}
                  </div>
                </button>
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

          {/* Activity Bar */}
          <div className="w-12 bg-[#333333] border-r border-[#3e3e42] flex flex-col items-center py-2 shrink-0 z-10">
            <div className="flex flex-col gap-0.5 flex-1">
              <button
                onClick={() => handleActivityBarClick(ActivityItem.Explorer)}
                className={`w-12 h-12 flex items-center justify-center transition-colors relative ${activity === ActivityItem.Explorer && !sidebarCollapsed
                  ? "text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-white"
                  : "text-[#858585] hover:text-white"
                  }`}
                title="Explorer"
                disabled={isInitialLoading}
              >
                <VscFiles className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleActivityBarClick(ActivityItem.Search)}
                className={`w-12 h-12 flex items-center justify-center transition-colors relative ${activity === ActivityItem.Search && !sidebarCollapsed
                  ? "text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-white"
                  : "text-[#858585] hover:text-white"
                  }`}
                title="Search"
                disabled={isInitialLoading}
              >
                <VscSearch className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Sidebar — manual width with CSS transition when not actively resizing */}
          <div
            className="bg-[#252526] flex flex-col shrink-0 overflow-hidden"
            style={{
              width: effectiveSidebarWidth,
              minWidth: 0,
              transition: isResizing ? "none" : "width 150ms ease",
              //borderRight: effectiveSidebarWidth > 0 ? "1px solid #3e3e42" : "none",
            }}
          >
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
          </div>

          {/* Resize handle */}
          <div
            className="relative shrink-0 w-px cursor-col-resize group"
            onMouseDown={onResizerMouseDown}
          >
            {/* Expanded hit area — wider on right when collapsed */}
            <div className={`absolute inset-y-0 -left-2 ${sidebarCollapsed ? "-right-4 z-10" : "-right-2"}`} />
            <div
              className={`h-full w-px transition-all duration-150 ${isResizing
                  ? "bg-[#007acc]"
                  : "bg-[#3e3e42] group-hover:bg-[#007acc]"
                }`}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden min-w-0">
            <DesktopMainContent tabs={tabs} />
          </div>
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
              transform: drawerOpen ? "translateY(0)" : "translateY(110%)",
              transition: dragStartY.current !== null ? "none" : "transform 300ms ease-out",
            }}
          >
            <div
              className="flex justify-center items-center py-3 shrink-0 select-none touch-none group/handle"
              style={{ cursor: dragStartY.current !== null ? "grabbing" : "ns-resize" }}
              onPointerDown={onDrawerHandlePointerDown}
              onPointerMove={onDrawerHandlePointerMove}
              onPointerUp={onDrawerHandlePointerUp}
              onPointerCancel={onDrawerHandlePointerUp}
            >
              <div className="w-10 h-1 rounded-full bg-[#555555] group-hover/handle:bg-[#007acc] transition-colors duration-150" />
            </div>

            <div className="px-4 pb-2 shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-[#858585] uppercase tracking-wider font-medium">
                {activity === ActivityItem.Explorer ? "Explorer" : "Search"}
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
                ? "text-white"
                : "text-[#858585] hover:text-[#cccccc]"
                }`}
            >
              <VscFiles className="w-5 h-5" />
              <span className="text-[9px] tracking-wide">Explorer</span>
            </button>
            <button
              onClick={() => handleActivityChange(ActivityItem.Search)}
              disabled={isInitialLoading}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${activity === ActivityItem.Search && drawerOpen
                ? "text-white"
                : "text-[#858585] hover:text-[#cccccc]"
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

function inferProvider(image?: string | null): string | null {
  if (!image) return null;
  if (image.includes("githubusercontent") || image.includes("avatars.githubusercontent")) return "github";
  if (image.includes("googleusercontent")) return "google";
  if (image.includes("cdn.discordapp")) return "discord";
  return null;
}

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