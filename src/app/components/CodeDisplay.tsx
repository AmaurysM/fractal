import { BiCopy, BiCheck, BiDownload, BiSave } from "react-icons/bi";
import { VscCode, VscChevronDown } from "react-icons/vsc";
import { MdNotes } from "react-icons/md";
import { ExplorerItemType, Snippet } from "../../../types/types";
import { useState, useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useTabStore } from "../store/tabStore";
import { useSnippet } from "../hooks/useSnippet";
import { useLibraryStore } from "../store/libraryStore";
import { useSession } from "next-auth/react";
import { Tab } from "./Tab";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { getFileExtension, getMonacoLanguage, LANGUAGES } from "../../../types/languages";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

export const CodeDisplay = () => {
  const { data: session } = useSession();
  const {
    tabs,
    selectedTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    updateTab,
    moveTabToIndex,
  } = useTabStore();

  const { editSnippet, fetchSnippet } = useSnippet();
  const { selectedItem, selectedItemType } = useLibraryStore();

  const [addingDescription, setAddingDescription] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tabContextMenu, setTabContextMenu] = useState<{
    x: number;
    y: number;
    snippetId: string;
  } | null>(null);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const saveTimeout = useRef<number | null>(null);
  const tabContextMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cachedSnippet = tabs.find((t) => t.id === selectedItem) ?? null;
  const [snippet, setSnippet] = useState<Snippet | undefined>(cachedSnippet ?? undefined);

  useEffect(() => {
    if (descriptionVisible && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [descriptionVisible]);

  useEffect(() => {
    if (!selectedItem) return;
    const cached = useTabStore.getState().tabs.find((t) => t.id === selectedItem);
    if (cached) setSnippet(cached);
  }, [selectedItem]);

  useEffect(() => {
    if (!session || !selectedItem || selectedItemType !== ExplorerItemType.File) return;
    const refresh = async () => {
      try {
        const updated = await fetchSnippet(selectedItem);
        if (updated) {
          setSnippet(updated);
          updateTab(updated);
        }
      } catch (error) {
        console.error("Failed to refresh snippet in CodeDisply:", error);
      }
    };
    refresh();
  }, [selectedItem, session]);

  useEffect(() => {
    if (!tabContextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (tabContextMenuRef.current && !tabContextMenuRef.current.contains(e.target as Node)) {
        setTabContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tabContextMenu]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
    const newIndex = tabs.findIndex((tab) => tab.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    moveTabToIndex(active.id as string, newIndex);
  }

  const scheduleSave = (updatedSnippet: Snippet) => {
    setSaveStatus("saving");
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      editSnippet(updatedSnippet);
      setSaveStatus("saved");
    }, 800);
  };

  const updateField = (field: keyof Snippet, value: string) => {
    if (!snippet) return;
    const updated = { ...snippet, [field]: value };
    setSnippet(updated);
    setSaveStatus("unsaved");
    scheduleSave(updated);
  };

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) => {
    editorRef.current = editor;

    editor.updateOptions({
      fontSize: 13,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace",
      lineHeight: 20,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      renderLineHighlight: "all",
      folding: true,
      showFoldingControls: "always",
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
      padding: { top: 16, bottom: 16 },
    });

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      if (snippet) {
        editSnippet(snippet);
        setSaveStatus("saved");
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    updateField("text", value || "");
  };

  const handleCopy = async () => {
    if (!snippet?.text) return;
    try {
      await navigator.clipboard.writeText(snippet.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (!snippet?.text) return;
    const element = document.createElement("a");
    const file = new Blob([snippet.text], { type: "text/plain" });
    const ext = getFileExtension(snippet.language);
    element.href = URL.createObjectURL(file);
    element.download = `${snippet.title || "snippet"}.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleManualSave = () => {
    if (!snippet) return;
    setSaveStatus("saving");
    editSnippet(snippet);
    setSaveStatus("saved");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const toggleDescription = () => {
    setDescriptionVisible((prev) => !prev);
  };

  if (tabs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e]">
        <div className="text-center max-w-md px-8">
          <VscCode className="w-24 h-24 text-[#3e3e42] mx-auto mb-6" />
          <h3 className="text-xl font-medium text-[#cccccc] mb-3">No Files Open</h3>
          <p className="text-[#858585] text-sm leading-relaxed">
            Select a code snippet from the sidebar to view and edit your code with Monaco Editor.
          </p>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e]">
        <div className="text-center max-w-md px-8">
          <VscCode className="w-24 h-24 text-[#3e3e42] mx-auto mb-6" />
          <h3 className="text-xl font-medium text-[#cccccc] mb-3">No File Selected</h3>
          <p className="text-[#858585] text-sm leading-relaxed">
            Select a code snippet from the sidebar to view and edit.
          </p>
        </div>
      </div>
    );
  }

  const lineCount = snippet.text ? snippet.text.split("\n").length : 0;
  const charCount = snippet?.text?.length ?? 0;
  const wordCount = snippet.text
    ? snippet.text.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const containerClasses = `${isFullscreen ? "fixed inset-0 z-50" : "h-full"
    } flex flex-col bg-[#1e1e1e]`;

  return (
    <>
      <div className={containerClasses}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div className="h-7.8 bg-[#252526] border-b border-[#3e3e42] flex items-end overflow-x-auto overflow-y-hidden scrollbar-none">
            <SortableContext
              items={tabs.map((t) => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  tabId={tab.id}
                  isActive={tab.id === selectedTab}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        {/* Tab Context Menu */}
        {tabContextMenu && (
          <div
            ref={tabContextMenuRef}
            className="fixed bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 min-w-45"
            style={{ left: tabContextMenu.x, top: tabContextMenu.y }}
          >
            <button
              onClick={() => { closeTab(tabContextMenu.snippetId); setTabContextMenu(null); }}
              className="w-full px-3 py-1.5 text-left text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { closeOtherTabs(tabContextMenu.snippetId); setTabContextMenu(null); }}
              className="w-full px-3 py-1.5 text-left text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
            >
              Close Others
            </button>
            <button
              onClick={() => { closeAllTabs(); setTabContextMenu(null); }}
              className="w-full px-3 py-1.5 text-left text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
            >
              Close All
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="h-8.75 bg-[#323233] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="flex items-center gap-2 px-2 py-1 text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] rounded-sm transition-colors"
                onClick={() => setShowSettings(!showSettings)}
              >
                <span>{LANGUAGES.find((l) => l.value === snippet.language)?.label || "Plain Text"}</span>
                <VscChevronDown className="w-3 h-3" />
              </button>

              {showSettings && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 max-h-64 overflow-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => { updateField("language", lang.value); setShowSettings(false); }}
                      className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#2a2d2e] transition-colors ${snippet.language === lang.value ? "bg-[#37373d] text-white" : "text-[#cccccc]"
                        }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-[#3e3e42]" />

            <div className="flex items-center gap-4 text-[11px] text-[#858585]">
              <span>Ln {lineCount}</span>
              <span>Ch {charCount}</span>
              <span>{wordCount} words</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Description toggle button */}
            <button
              onClick={toggleDescription}
              className={`relative p-1.5 rounded-sm transition-colors duration-150 hover:bg-[#2a2d2e] ${descriptionVisible ? "bg-[#2a2d2e]" : ""
                }`}
              title={descriptionVisible ? "Hide description" : "Add / show description"}
            >
              <MdNotes
                className={`w-4 h-4 transition-all duration-150 ${descriptionVisible ? "text-[#4ec9b0] scale-110" : "text-[#cccccc]"
                  }`}
              />
              {/* Dot indicator when there's saved content */}
              <span
                className={`absolute top-0.75 right-0.75 w-1.25 h-1.25 rounded-full bg-[#4ec9b0] transition-all duration-200 ${snippet.description?.trim()
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-0"
                  }`}
              />
            </button>

            <div className="h-4 w-px bg-[#3e3e42] mx-0.5" />

            <button onClick={handleCopy} className="p-1.5 hover:bg-[#2a2d2e] rounded-sm transition-colors text-[#cccccc]" title="Copy">
              {copied ? <BiCheck className="w-4 h-4 text-[#4ec9b0]" /> : <BiCopy className="w-4 h-4" />}
            </button>

            {/* Download — icon slides down then crossfades to a checkmark */}
            <button
              onClick={handleDownload}
              className="relative p-1.5 hover:bg-[#2a2d2e] rounded-sm text-[#cccccc] overflow-hidden"
              title="Download"
            >
              <BiDownload
                className={`w-4 h-4 transition-all duration-150 ${downloaded
                    ? "opacity-0 translate-y-1 text-[#4ec9b0]"
                    : "opacity-100 translate-y-0"
                  }`}
              />
              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 text-[#4ec9b0] ${downloaded ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}>
                <BiCheck className="w-4 h-4" />
              </span>
            </button>

            {/* Save — icon shrinks away, checkmark pops in with slight overshoot */}
            <button
              onClick={handleManualSave}
              className="relative p-1.5 hover:bg-[#2a2d2e] rounded-sm text-[#cccccc] overflow-hidden"
              title="Save (Ctrl+S)"
            >
              <BiSave
                className={`w-4 h-4 transition-all duration-150 ${justSaved ? "opacity-0 scale-50" : "opacity-100 scale-100"
                  }`}
              />
              <span className={`absolute inset-0 flex items-center justify-center text-[#4ec9b0] transition-all duration-200 ${justSaved ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-12"
                }`}>
                <BiCheck className="w-4 h-4" />
              </span>
            </button>

            <div className="h-4 w-px bg-[#3e3e42] mx-1" />

            {/* Fullscreen — scales up on hover, turns amber when active */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-[#2a2d2e] rounded-sm group"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <MdFullscreenExit
                  className="w-4 h-4 text-[#cca700] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                />
              ) : (
                <MdFullscreen
                  className="w-4 h-4 text-[#cccccc] transition-transform duration-200 group-hover:scale-110"
                />
              )}
            </button>
          </div>
        </div>

        {/* Animated Description Panel — grid-rows trick for smooth height */}
        <div
          className={`grid border-b border-[#3e3e42] bg-[#252526] transition-all duration-200 ease-in-out ${descriptionVisible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pt-2.5 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#858585] uppercase tracking-wider select-none">
                  Description
                </span>
                <span
                  className={`text-[10px] tabular-nums transition-colors duration-150 ${(snippet.description?.length ?? 0) > 280 ? "text-[#f48771]" : "text-[#585858]"
                    }`}
                >
                  {snippet.description?.length ?? 0} / 300
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 text-[12px] text-[#cccccc] resize-none placeholder-[#4e4e4e] leading-relaxed transition-colors duration-150 focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]/10"
                rows={2}
                maxLength={300}
                value={snippet.description ?? ""}
                placeholder="Describe what this snippet does…"
                onChange={(e) => updateField("description", e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0">
            <Editor
              key={snippet.id}
              language={getMonacoLanguage(snippet.language)}
              theme="vs-dark"
              value={snippet.text}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              height="100%"
              options={{
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontSize: 13,
                fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace",
                lineHeight: 20,
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#858585] text-[13px]">Loading editor...</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-5.5 bg-[#007acc] flex items-center justify-between px-3 text-[11px] text-white shrink-0">
          <div className="flex items-center gap-4">
            {saveStatus === "saving" && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center gap-1.5">
                <BiCheck className="w-3 h-3" />
                <span>Saved</span>
              </div>
            )}
            {saveStatus === "unsaved" && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full inline-block" />
                <span>Modified</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 opacity-80">
            <span>UTF-8</span>
            <span>{LANGUAGES.find((l) => l.value === snippet.language)?.label || "Plain Text"}</span>
            <span>
              {tabs.length} {tabs.length === 1 ? "file" : "files"} open
            </span>
          </div>
        </div>
      </div>
    </>
  );
};