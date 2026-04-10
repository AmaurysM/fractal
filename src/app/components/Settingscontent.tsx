"use client";

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildOptionResolver, PendingChanges, TAB_SECTIONS, getAllSettings } from "../../../types/settings.config";
import { SettingTabs, SettingSection } from "../../../types/settings.types";
import { useSettings } from "../hooks/useSettings";
import { useSettingsStore } from "../store/SettingsStore";


const PULSE_STYLE = `
  @keyframes row-pulse {
    0%   { background-color: rgba(106, 159, 216, 0.20); }
    100% { background-color: transparent; }
  }
  .row-pulse { animation: row-pulse 0.7s ease-out forwards; }
`;

const UnsavedDialog = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div
    style={{ minHeight: 180 }}
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div className="bg-[#1e1f20] border border-[#3a3a3a] rounded-lg shadow-xl p-6 w-80 flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold text-[#e0e0e0]">Unsaved changes</h3>
      <p className="text-[12px] text-[#9a9a9a] leading-relaxed">
        You have unsaved changes. If you leave now they will be lost.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[12px] text-[#9a9a9a] hover:text-[#ccc] rounded border border-[#3a3a3a] hover:border-[#555] transition-colors duration-100"
        >
          Stay
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1.5 text-[12px] text-white bg-[#c0392b] hover:bg-[#a93226] rounded transition-colors duration-100"
        >
          Discard & leave
        </button>
      </div>
    </div>
  </div>
);


const SaveBar = ({ onSave, onDiscard }: { onSave: () => void; onDiscard: () => void }) => (
  <div className="sticky bottom-0 z-10 flex items-center justify-between px-5 py-3 bg-[#1a1b1c] border-t border-[#2a2b2c]">
    <span className="text-[11px] text-[#888]">You have unsaved changes</span>
    <div className="flex gap-2">
      <button
        onClick={onDiscard}
        className="px-3 py-1.5 text-[12px] text-[#9a9a9a] hover:text-[#ccc] rounded border border-[#3a3a3a] hover:border-[#555] transition-colors duration-100"
      >
        Discard
      </button>
      <button
        onClick={onSave}
        className="px-3 py-1.5 text-[12px] text-white bg-[#6a9fd8] hover:bg-[#5b8ec7] rounded transition-colors duration-100"
      >
        Save changes
      </button>
    </div>
  </div>
);


const EMPTY_PENDING: PendingChanges = { user: {}, editor: {} };
const hasPendingChanges = (p: PendingChanges) =>
  Object.keys(p.user).length > 0 || Object.keys(p.editor).length > 0;


const SettingRow = ({
  setting,
  Component,
}: {
  setting: string;
  Component: () => JSX.Element;
}) => {
  const flashedSetting = useSettingsStore((s) => s.flashedSetting);
  const setFlashedSetting = useSettingsStore((s) => s.setFlashedSetting);
  const [isPulsing, setIsPulsing] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flashedSetting !== setting) return;
    setIsPulsing(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsPulsing(true);
      });
    });
    rowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const t = setTimeout(() => {
      setIsPulsing(false);
      setFlashedSetting(null);
    }, 700);
    return () => clearTimeout(t);
  }, [flashedSetting]); 

  return (
    <div
      ref={rowRef}
      className={`group flex items-center justify-between px-5 py-2 gap-4 transition-colors duration-100 ${isPulsing ? "row-pulse" : "hover:bg-[#252627]"
        }`}
    >
      <label className="text-[12px] text-[#9a9a9a] group-hover:text-[#ccc] transition-colors duration-100 capitalize flex-1 min-w-0 truncate">
        {setting}
      </label>
      <div className="shrink-0">
        {Component()}
      </div>
    </div>
  );
};


const SectionBlock = ({
  section,
  resolver,
}: {
  section: SettingSection;
  resolver: ReturnType<typeof buildOptionResolver>;
}) => (
  <div>
    <div className="flex items-center gap-3 px-5 pt-5 pb-1">
      <span className="text-[10px] uppercase tracking-widest text-[#555] font-semibold">
        {section.label}
      </span>
      <div className="flex-1 h-px bg-[#2a2b2c]" />
    </div>
    {section.settings.map((setting) => (
      <SettingRow key={setting} setting={setting} Component={resolver[setting]} />
    ))}
  </div>
);

interface Props {
  selectedTab: SettingTabs;
  activeSection: string | null;
  search: string;
  onTabChangeRequest?: (next: SettingTabs) => void;
}

export const SettingsContent = ({ selectedTab, activeSection, search, onTabChangeRequest }: Props) => {
  const { settings, updateUserSettings, updateEditorSettings } = useSettings();

  const [pending, setPending] = useState<PendingChanges>(EMPTY_PENDING);
  const isDirty = hasPendingChanges(pending);
  const [pendingTab, setPendingTab] = useState<SettingTabs | null>(null);
  const showDialog = isDirty && pendingTab !== null;
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  useEffect(() => { setPending(EMPTY_PENDING); }, [selectedTab]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const updatePendingUser = useCallback(
    (patch: Partial<PendingChanges["user"]>) =>
      setPending((prev) => ({ ...prev, user: { ...prev.user, ...patch } })),
    []
  );
  const updatePendingEditor = useCallback(
    (patch: Partial<PendingChanges["editor"]>) =>
      setPending((prev) => ({ ...prev, editor: { ...prev.editor, ...patch } })),
    []
  );

  const handleSave = useCallback(() => {
    if (Object.keys(pending.user).length > 0) updateUserSettings(pending.user);
    if (Object.keys(pending.editor).length > 0) updateEditorSettings(pending.editor);
    setPending(EMPTY_PENDING);
  }, [pending, updateUserSettings, updateEditorSettings]);

  const handleDiscard = useCallback(() => setPending(EMPTY_PENDING), []);

  const handleDialogConfirm = useCallback(() => {
    setPending(EMPTY_PENDING);
    if (pendingTab !== null && onTabChangeRequest) onTabChangeRequest(pendingTab);
    setPendingTab(null);
  }, [pendingTab, onTabChangeRequest]);

  const handleDialogCancel = useCallback(() => setPendingTab(null), []);

  const resolver = useMemo(
    () =>
      buildOptionResolver(settings, pending, {
        updatePendingUser,
        updatePendingEditor,
      }),
    [settings, pending, updatePendingUser, updatePendingEditor]
  );

  const isSearching = search.trim().length > 0;
  const allSections = TAB_SECTIONS[selectedTab];

  const renderContent = () => {
    if (isSearching) {
      const matches = getAllSettings().filter((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
      return (
        <>
          <div className="px-5 pt-4 pb-3 border-b border-[#2a2b2c]">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888]">
              {matches.length} result{matches.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <div className="flex flex-col py-2">
            {matches.length === 0 && (
              <p className="px-5 py-6 text-[12px] text-[#555] italic">No settings match your search.</p>
            )}
            {matches.map((setting) => (
              <SettingRow key={setting} setting={setting} Component={resolver[setting]} />
            ))}
          </div>
        </>
      );
    }

    if (activeSection) {
      const section = allSections.find((s) => s.label === activeSection);
      return (
        <>
          <div className="px-5 pt-4 pb-3 border-b border-[#2a2b2c] flex items-center gap-2">
            <span className="text-[11px] text-[#555] uppercase tracking-widest">{selectedTab}</span>
            <span className="text-[#444]">/</span>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6a9fd8]">
              {activeSection}
            </h2>
          </div>
          <div className="flex flex-col py-2">
            {section && <SectionBlock section={section} resolver={resolver} />}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="px-5 pt-4 pb-3 border-b border-[#2a2b2c]">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6a9fd8]">
            {selectedTab}
          </h2>
        </div>
        <div className="flex flex-col pb-4">
          {allSections.map((section) => (
            <SectionBlock key={section.label} section={section} resolver={resolver} />
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <style>{PULSE_STYLE}</style>
      <main className="relative flex flex-col w-full overflow-y-auto">
        {showDialog && (
          <UnsavedDialog onConfirm={handleDialogConfirm} onCancel={handleDialogCancel} />
        )}
        {renderContent()}
        {isDirty && !showDialog && (
          <SaveBar onSave={handleSave} onDiscard={handleDiscard} />
        )}
      </main>
    </>
  );
};