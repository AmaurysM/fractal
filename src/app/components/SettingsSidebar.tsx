"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { BiChevronRight } from "react-icons/bi";
import { SettingTabs } from "../../../types/settings.types";
import { TAB_SECTIONS } from "../../../types/settings.config";
import { useSettingsStore } from "../store/SettingsStore";

const TAB_ICONS: Record<SettingTabs, string> = {
  [SettingTabs.USER]: "⌘",
  [SettingTabs.CODE]: "{ }",
};

interface Props {
  selectedTab: SettingTabs;
  setSelectedTab: Dispatch<SetStateAction<SettingTabs>>;
  activeSection: string | null;
  setActiveSection: Dispatch<SetStateAction<string | null>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export const SettingsSidebar = ({
  selectedTab,
  setSelectedTab,
  activeSection,
  setActiveSection,
  search,
  setSearch,
}: Props) => {
  const [openTab, setOpenTab] = useState<SettingTabs | null>(SettingTabs.USER);
  // const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const setFlashedSetting = useSettingsStore((s) => s.setFlashedSetting);

  const handleTabClick = (tab: SettingTabs) => {
    setSelectedTab(tab);
    setActiveSection(null);
    setOpenTab((prev) => (prev === tab ? null : tab));
  };

  // const handleSectionClick = (tab: SettingTabs, sectionLabel: string) => {
  //   setSelectedTab(tab);
  //   setOpenSections((prev) => {
  //     const next = new Set(prev);
  //     if (next.has(sectionLabel)) next.delete(sectionLabel);
  //     else next.add(sectionLabel);
  //     return next;
  //   });
  //   setActiveSection((prev) => (prev === sectionLabel ? null : sectionLabel));
  // };

  const handleSectionClick = (tab: SettingTabs, sectionLabel: string) => {
    setSelectedTab(tab);
    setActiveSection((prev) => (prev === sectionLabel ? null : sectionLabel));
  };

  return (
    <aside className="flex flex-col border-r border-[#2a2b2c] h-full w-52 shrink-0 bg-[#1e1f20]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2b2c]">
        <CiSearch className="text-[#666] shrink-0" size={14} />
        <input
          type="search"
          name="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveSection(null);
          }}
          autoComplete="off"
          placeholder="Search settings…"
          className="bg-transparent text-[12px] text-[#ccc] placeholder-[#555] flex-1 focus:outline-none"
        />
      </div>

      <nav className="flex flex-col py-1 overflow-y-auto flex-1">
        {Object.values(SettingTabs).map((tab) => {
          const isTabSelected = selectedTab === tab;
          const isTabOpen = openTab === tab;
          const sections = TAB_SECTIONS[tab];

          return (
            <div key={tab}>
              <button
                onClick={() => handleTabClick(tab)}
                className={`
                  w-full flex items-center gap-2 px-3 py-1.5 text-left
                  text-[12px] font-medium tracking-wide uppercase
                  transition-colors duration-100 cursor-pointer
                  ${isTabSelected
                    ? "text-[#e8e8e8] bg-[#2a2b2c]"
                    : "text-[#888] hover:text-[#bbb] hover:bg-[#252627]"
                  }
                `}
              >
                <span className="text-[10px] w-5 text-center font-mono text-[#6a9fd8] opacity-80">
                  {TAB_ICONS[tab]}
                </span>
                <span className="flex-1">{tab}</span>
                <BiChevronRight
                  size={13}
                  className={`transition-transform duration-200 ${isTabOpen ? "rotate-90" : ""} text-[#555]`}
                />
              </button>

              {isTabOpen && (
                <div className="flex flex-col bg-[#1a1b1c]">
                  {sections.map((section) => {
                    // const isSectionOpen = openSections.has(section.label);
                    const isSectionOpen = activeSection === section.label && isTabSelected;

                    const isActive = activeSection === section.label && isTabSelected;

                    return (
                      <div key={section.label}>
                        <button
                          onClick={() => handleSectionClick(tab, section.label)}
                          className={`
                            w-full flex items-center gap-1.5 pl-8 pr-3 py-1.5
                            text-[11px] text-left cursor-pointer
                            transition-colors duration-100
                            ${isActive
                              ? "text-[#6a9fd8] bg-[#1f2937]"
                              : "text-[#777] hover:text-[#aaa] hover:bg-[#222]"
                            }
                          `}
                        >
                          <BiChevronRight
                            size={11}
                            className={`shrink-0 transition-transform duration-150 ${isSectionOpen ? "rotate-90" : ""} opacity-60`}
                          />
                          <span className="capitalize tracking-wide">{section.label}</span>
                          <span className="ml-auto text-[10px] opacity-40">{section.settings.length}</span>
                        </button>

                        {isSectionOpen && (
                          <div className="flex flex-col bg-[#161718] border-l border-[#2a2b2c] ml-8">
                            {section.settings.map((setting) => (
                              <button
                                key={setting}
                                onClick={() => {
                                  setSelectedTab(tab);
                                  setActiveSection(section.label);
                                  setFlashedSetting(setting);
                                }} className="w-full text-left pl-3 pr-3 py-1 text-[10px] text-[#555] hover:text-[#888] hover:bg-[#1e1f20] capitalize truncate transition-colors duration-100 cursor-pointer"
                              >
                                {setting}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};