"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
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

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60"
      onClick={() => onClick(false)}
    >
      <div
        className="flex flex-col w-180 h-120 bg-[#252526] rounded-lg border border-[#2a2b2c] shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-[#2a2b2c] bg-[#1e1f20] shrink-0 h-6 ">

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


          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onClick(false)}
              className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer"
            />
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
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
      </div>
    </div>
  );
};