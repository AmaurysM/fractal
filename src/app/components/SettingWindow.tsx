"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { SettingTabs } from "../../../types/settings.types";
import { useSettings } from "../hooks/useSettings";
import { SettingsContent } from "./Settingscontent";
import { SettingsSidebar } from "./SettingsSidebar";

interface Props {
  onClick: Dispatch<SetStateAction<boolean>>;
}

const STATUS_LABEL: Record<string, string> = {
  idle: "",
  loading: "Loading…",
  saving: "Saving…",
  saved: "Saved",
  error: "Error saving",
};

const STATUS_COLOR: Record<string, string> = {
  saving: "text-[#888]",
  saved: "text-[#4ec9b0]",
  error: "text-[#f48771]",
};

export const SettingWindow = ({ onClick }: Props) => {
  const [selectedTab, setSelectedTab] = useState<SettingTabs>(SettingTabs.USER);
  const [search, setSearch] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { fetchSettings, status, resetEditorSettings } = useSettings();

  const [sheetHeight, setSheetHeight] = useState(92);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(92);

  useEffect(() => {
    fetchSettings();
  }, []);

  function onHandlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    dragStartHeight.current = sheetHeight;
  }

  function onHandlePointerMove(e: React.PointerEvent) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - e.clientY;
    const screenH = window.innerHeight;
    const newHeight = Math.min(97, Math.max(20, dragStartHeight.current + (delta / screenH) * 100));
    setSheetHeight(newHeight);
  }

  function onHandlePointerUp() {
    dragStartY.current = null;
    if (sheetHeight < 30) {
      onClick(false);
    } else if (sheetHeight > 85) {
      setSheetHeight(92);
    }
  }

  const sharedProps = {
    selectedTab,
    setSelectedTab,
    activeSection,
    setActiveSection,
    search,
    setSearch,
    status,
    resetEditorSettings,
    onClose: () => onClick(false),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm bg-black/60"
      onClick={() => onClick(false)}
    >
      {/* ── Mobile bottom sheet ── */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#252526] rounded-t-2xl border border-[#2a2b2c] shadow-2xl overflow-hidden will-change-transform"
        style={{
          height: `${sheetHeight}dvh`,
          transition: dragStartY.current !== null ? "none" : "height 250ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-center items-center py-3 shrink-0 select-none touch-none group/handle"
          style={{ cursor: dragStartY.current !== null ? "grabbing" : "ns-resize" }}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <div className="w-9 h-1 rounded-full bg-[#444] group-hover/handle:bg-[#6a9fd8] transition-colors duration-150" />
        </div>
        <SheetContents {...sharedProps} />
      </div>

      {/* ── Desktop modal ── */}
      <div
        className="hidden sm:flex flex-col w-180 md:w-195 h-120 md:h-130 bg-[#252526] rounded-lg border border-[#2a2b2c] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <SheetContents {...sharedProps} />
      </div>
    </div>
  );
};

interface SheetContentsProps {
  selectedTab: SettingTabs;
  setSelectedTab: Dispatch<SetStateAction<SettingTabs>>;
  activeSection: string | null;
  setActiveSection: Dispatch<SetStateAction<string | null>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  status: string;
  resetEditorSettings: () => void;
  onClose: () => void;
}

function SheetContents({
  selectedTab,
  setSelectedTab,
  activeSection,
  setActiveSection,
  search,
  setSearch,
  status,
  resetEditorSettings,
  onClose,
}: SheetContentsProps) {
  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#2a2b2c] bg-[#1e1f20] shrink-0 min-h-10">
        <div className="flex items-center gap-3 text-[12px]">
          {STATUS_LABEL[status] && (
            <span className={`text-[10px] ${STATUS_COLOR[status] ?? "text-[#666]"}`}>
              {STATUS_LABEL[status]}
            </span>
          )}
          {selectedTab === SettingTabs.CODE && (
            <button
              onClick={resetEditorSettings}
              className="text-[10px] text-[#555] hover:text-[#aaa] transition-colors cursor-pointer"
              title="Reset editor settings to defaults"
            >
              Reset
            </button>
          )}
        </div>

        <span className="text-[12px] font-medium text-[#666] tracking-wide absolute left-1/2 -translate-x-1/2">
          voronoi — settings
        </span>

        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer"
        />
      </header>

      <div className="flex flex-col sm:flex-row flex-1 min-h-0">
        <SettingsSidebar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          search={search}
          setSearch={setSearch}
        />
        <SettingsContent
          selectedTab={selectedTab}
          activeSection={activeSection}
          search={search}
        />
      </div>
    </>
  );
}