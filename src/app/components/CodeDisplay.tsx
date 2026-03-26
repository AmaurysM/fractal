import { BiCopy, BiCheck, BiDownload, BiSave } from "react-icons/bi";
import { VscCode, VscChevronDown } from "react-icons/vsc";
import { Snippet } from "../../../types/types";
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

export const CodeDisplay = () => {
  const { data: session } = useSession();
  const {
    tabs,
    selectedTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    updateTab
  } = useTabStore();

  const {
    editSnippet,
    fetchSnippet,
  } = useSnippet();

  const {
    selectedItem,
    setSelectedItem
  } = useLibraryStore();

  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number; snippetId: string } | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const saveTimeout = useRef<number | null>(null);
  const tabContextMenuRef = useRef<HTMLDivElement>(null);
  const cachedSnippet = tabs.find((t) => t.id === selectedItem) ?? null;
  const [snippet, setSnippet] = useState<Snippet | undefined>(cachedSnippet ?? undefined);

  useEffect(() => {
    if (!selectedItem) return;
    const cached = useTabStore.getState().tabs.find((t) => t.id === selectedItem);
    if (cached) setSnippet(cached);
  }, [selectedItem]);

  useEffect(() => {
    if (!session || !selectedItem) return;

    const refresh = async () => {
      try {
        const updated = await fetchSnippet(selectedItem);
        if (updated) {
          setSnippet(updated);
          updateTab(updated); // keep tab cache fresh
        }
      } catch (error) {
        console.error("Failed to refresh snippet:", error);
      }
    };

    refresh();
  }, [selectedItem, session]);

  const scheduleSave = (updatedSnippet: Snippet) => {
    setSaveStatus('saving');
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      editSnippet(updatedSnippet);
      setSaveStatus('saved');
    }, 800);
  };

  const updateField = (field: keyof Snippet, value: string) => {
    if (!snippet) return;

    if (field === 'text') snippet.text = (value);
    if (field === 'description') snippet.description = (value);
    if (field === 'language') snippet.language = (value);
    if (field === 'title') snippet.title = (value);

    const updated = { ...snippet, [field]: value };

    setSaveStatus('unsaved');
    scheduleSave(updated);
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    editor.updateOptions({
      fontSize: 13,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace",
      lineHeight: 20,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      renderLineHighlight: 'all',
      folding: true,
      showFoldingControls: 'always',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      padding: { top: 16, bottom: 16 },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (snippet) {
        const updatedSnippet = {
          ...snippet,
          text: snippet.text,
          description: snippet.description,
          language: snippet.language,
          title: snippet.title,
        };
        editSnippet?.(updatedSnippet);
        setSaveStatus('saved');
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
      console.error("Failed to copy text: ", err);
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
  };

  const handleManualSave = () => {
    if (snippet) {
      setSaveStatus('saving');
      const updatedSnippet = {
        ...snippet,
        text: snippet.text,
        description: snippet.description,
        language: snippet.language,
        title: snippet.title,
      };
      editSnippet?.(updatedSnippet);
      setSaveStatus('saved');
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e]">
        <div className="text-center max-w-md px-8">
          <VscCode className="w-24 h-24 text-[#3e3e42] mx-auto mb-6" />
          <h3 className="text-xl font-medium text-[#cccccc] mb-3">
            No Files Open
          </h3>
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
          <h3 className="text-xl font-medium text-[#cccccc] mb-3">
            No File Selected
          </h3>
          <p className="text-[#858585] text-sm leading-relaxed">
            Select a code snippet from the sidebar to view and edit.
          </p>
        </div>
      </div>
    );
  }

  const lineCount = snippet.text ? snippet.text.split("\n").length : 0;
  const charCount = snippet?.text?.length;
  const wordCount = snippet.text ? snippet.text.trim().split(/\s+/).filter(Boolean).length : 0;

  const containerClasses = `${isFullscreen ? "fixed inset-0 z-50" : "h-full"
    } flex flex-col bg-[#1e1e1e]`;

  return (
    <div className={containerClasses}>
      {/* Tab Bar */}
      <div className="h-8.75 bg-[#252526] border-b border-[#3e3e42] flex items-center overflow-x-auto overflow-y-hidden">

        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tabId={tab.id}
            isActive={tab.id === selectedTab}
          />
        ))}
      </div>

      {/* Tab Context Menu */}
      {tabContextMenu && (
        <div
          ref={tabContextMenuRef}
          className="fixed bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 min-w-45"
          style={{ left: tabContextMenu.x, top: tabContextMenu.y }}
        >
          <button
            onClick={() => {
              closeTab(tabContextMenu.snippetId);
              setTabContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              closeOtherTabs(tabContextMenu.snippetId);
              setTabContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
          >
            Close Others
          </button>
          <button
            onClick={() => {
              closeAllTabs();
              setTabContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
          >
            Close All
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="h-8.75 bg-[#323233] border-b border-[#3e3e42] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-2 py-1 text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] rounded-sm transition-colors"
              onClick={() => setShowSettings(!showSettings)}
            >
              <span>{LANGUAGES.find(l => l.value === snippet.language)?.label || "Plain Text"}</span>
              <VscChevronDown className="w-3 h-3" />
            </button>

            {showSettings && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 max-h-64 overflow-auto">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      updateField("language", lang.value);
                      setShowSettings(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#2a2d2e] transition-colors ${snippet.language === lang.value ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'
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
            <span>Col {charCount}</span>
            <span>{wordCount} words</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-[#2a2d2e] rounded-sm transition-colors text-[#cccccc]"
            title="Copy"
          >
            {copied ? <BiCheck className="w-4 h-4 text-[#4ec9b0]" /> : <BiCopy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-[#2a2d2e] rounded-sm transition-colors text-[#cccccc]"
            title="Download"
          >
            <BiDownload className="w-4 h-4" />
          </button>
          <button
            onClick={handleManualSave}
            className="p-1.5 hover:bg-[#2a2d2e] rounded-sm transition-colors text-[#cccccc]"
            title="Save (Ctrl+S)"
          >
            <BiSave className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#3e3e42] mx-1" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-[#2a2d2e] rounded-sm transition-colors text-[#cccccc]"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <MdFullscreenExit className="w-4 h-4" /> : < MdFullscreen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Description Area (if exists) */}
      {snippet.description && (
        <div className="bg-[#252526] border-b border-[#3e3e42] px-4 py-2">
          <textarea
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 text-[12px] text-[#cccccc] resize-none focus:outline-none focus:border-[#007acc] placeholder-[#6e6e6e]"
            rows={2}
            value={snippet.description}
            placeholder="Add a description..."
          />
        </div>
      )}

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
      <div className="h-5.5 bg-[#007acc] flex items-center justify-between px-3 text-[11px] text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <>
                <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <BiCheck className="w-3 h-3" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 bg-white rounded-full" />
                <span>Modified</span>
              </>
            )}
          </div>

        </div>

        <div className="flex items-center gap-4 opacity-80">
          <span>UTF-8</span>
          <span>{LANGUAGES.find(l => l.value === snippet.language)?.label || "Plain Text"}</span>
          <span>{tabs.length} {tabs.length === 1 ? 'file' : 'files'} open</span>
        </div>
      </div>
    </div>
  );
};