import { BiCopy, BiCheck, BiDownload, BiSave } from "react-icons/bi";
import { VscCode, VscChevronDown, VscClose, VscChromeMaximize, VscChromeRestore } from "react-icons/vsc";
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiC, SiKotlin, SiHtml5, SiCss3, SiJson, SiPhp, SiGo, SiRust } from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { TbBrandCSharp } from "react-icons/tb";

import { AiOutlineFileText } from "react-icons/ai";
import { Snippet } from "../../../types/types";
import { useState, useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useAppStore } from "../store/useAppStore";

const LANGUAGES = [
  { value: "", label: "Plain Text", monaco: "plaintext", ext: "txt", icon: AiOutlineFileText, color: "#858585" },
  { value: "JavaScript", label: "JavaScript", monaco: "javascript", ext: "js", icon: SiJavascript, color: "#f7df1e" },
  { value: "TypeScript", label: "TypeScript", monaco: "typescript", ext: "ts", icon: SiTypescript, color: "#3178c6" },
  { value: "Python", label: "Python", monaco: "python", ext: "py", icon: SiPython, color: "#3776ab" },
  { value: "Java", label: "Java", monaco: "java", ext: "java", icon: FaJava, color: "#007396" },
  { value: "C++", label: "C++", monaco: "cpp", ext: "cpp", icon: SiCplusplus, color: "#00599c" },
  { value: "C#", label: "C#", monaco: "csharp", ext: "cs", icon: TbBrandCSharp, color: "#239120" },
  { value: "C", label: "C", monaco: "c", ext: "c", icon: SiC, color: "#a8b9cc" },
  { value: "Kotlin", label: "Kotlin", monaco: "kotlin", ext: "kt", icon: SiKotlin, color: "#7f52ff" },
  { value: "Node.js", label: "Node.js", monaco: "javascript", ext: "js", icon: SiJavascript, color: "#339933" },
  { value: "HTML", label: "HTML", monaco: "html", ext: "html", icon: SiHtml5, color: "#e34c26" },
  { value: "CSS", label: "CSS", monaco: "css", ext: "css", icon: SiCss3, color: "#1572b6" },
  { value: "JSON", label: "JSON", monaco: "json", ext: "json", icon: SiJson, color: "#000000" },
  { value: "SQL", label: "SQL", monaco: "sql", ext: "sql", icon: AiOutlineFileText, color: "#e38c00" },
  { value: "PHP", label: "PHP", monaco: "php", ext: "php", icon: SiPhp, color: "#777bb4" },
  { value: "Go", label: "Go", monaco: "go", ext: "go", icon: SiGo, color: "#00add8" },
  { value: "Rust", label: "Rust", monaco: "rust", ext: "rs", icon: SiRust, color: "#000000" },
];

export const CodeDisplay = () => {
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number; snippetId: string } | null>(null);
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [editingFilename, setEditingFilename] = useState("");

  const [uiText, setUiText] = useState("");
  const [uiDescription, setUiDescription] = useState("");
  const [uiLanguage, setUiLanguage] = useState("");
  const [uiTitle, setUiTitle] = useState("");

  const {
    user,
    openTabs,
    activeTabId,
    selectedSnippet,
    saveSnippet,
    closeTab,
    setActiveTab,
    closeAllTabs,
    closeOtherTabs,
    isHydrated
  } = useAppStore();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const saveTimeout = useRef<number | null>(null);
  const tabContextMenuRef = useRef<HTMLDivElement>(null);
  const filenameInputRef = useRef<HTMLInputElement>(null);

  const userTabs = openTabs;
  const snippet = selectedSnippet;

  useEffect(() => {
    if (selectedSnippet) {
      setUiText(selectedSnippet.text || "");
      setUiDescription(selectedSnippet.description || "");
      setUiLanguage(selectedSnippet.language || "");
      setUiTitle(selectedSnippet.title || "");
      setSaveStatus('saved');
    }
  }, [selectedSnippet]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tabContextMenuRef.current && !tabContextMenuRef.current.contains(e.target as Node)) {
        setTabContextMenu(null);
      }
    };

    if (tabContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tabContextMenu]);

  useEffect(() => {
    if (isEditingFilename && filenameInputRef.current) {
      filenameInputRef.current.focus();
      filenameInputRef.current.select();
    }
  }, [isEditingFilename]);

  const scheduleSave = (updatedSnippet: Snippet) => {
    setSaveStatus('saving');
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      if (saveSnippet) {
        saveSnippet(updatedSnippet);
        setSaveStatus('saved');
      }
    }, 800);
  };

  const updateField = (field: keyof Snippet, value: string) => {
    if (!selectedSnippet) return;

    // Update UI state immediately
    if (field === 'text') setUiText(value);
    if (field === 'description') setUiDescription(value);
    if (field === 'language') setUiLanguage(value);
    if (field === 'title') setUiTitle(value);

    // Create updated snippet with new value
    const updated = { ...selectedSnippet, [field]: value };
    
    // Immediately update the snippet in the store's UI arrays for real-time explorer updates
    const { uiSnippets, uiParentSnippets, openTabs, foundSnippets } = useAppStore.getState();
    
    useAppStore.setState({
      uiSnippets: uiSnippets.map(s => s.id === updated.id ? updated : s),
      uiParentSnippets: uiParentSnippets.map(s => s.id === updated.id ? updated : s),
      openTabs: openTabs.map(tab => tab.id === updated.id ? updated : tab),
      foundSnippets: foundSnippets.map(s => s.id === updated.id ? updated : s),
      selectedSnippet: updated,
      lastSelectedItem: updated
    });
    
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
      if (selectedSnippet) {
        const updatedSnippet = {
          ...selectedSnippet,
          text: uiText,
          description: uiDescription,
          language: uiLanguage,
          title: uiTitle,
        };
        saveSnippet?.(updatedSnippet);
        setSaveStatus('saved');
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    updateField("text", value || "");
  };

  const handleCopy = async () => {
    if (!uiText) return;
    try {
      await navigator.clipboard.writeText(uiText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownload = () => {
    if (!uiText) return;
    const element = document.createElement("a");
    const file = new Blob([uiText], { type: "text/plain" });
    const ext = getFileExtension(uiLanguage);
    element.href = URL.createObjectURL(file);
    element.download = `${uiTitle || "snippet"}.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileExtension = (language?: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.ext || "txt";
  };

  const getMonacoLanguage = (language?: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.monaco || "plaintext";
  };

  const getLanguageIcon = (language?: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.icon || AiOutlineFileText;
  };

  const getLanguageColor = (language?: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.color || "#858585";
  };

  const handleTabContextMenu = (e: React.MouseEvent, snippetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTabContextMenu({ x: e.clientX, y: e.clientY, snippetId });
  };

  const handleCloseTab = (e: React.MouseEvent, snippetId: string) => {
    e.stopPropagation();
    closeTab(snippetId);
  };

  const handleManualSave = () => {
    if (selectedSnippet) {
      const updatedSnippet = {
        ...selectedSnippet,
        text: uiText,
        description: uiDescription,
        language: uiLanguage,
        title: uiTitle,
      };
      saveSnippet?.(updatedSnippet);
      setSaveStatus('saved');
    }
  };

  const handleFilenameEdit = () => {
    // Just show the title for editing, not the extension
    setEditingFilename(uiTitle);
    setIsEditingFilename(true);
  };

  const handleFilenameChange = (newFilename: string) => {
    setEditingFilename(newFilename);
    
    if (!selectedSnippet) return;
    
    // Check if filename has an extension
    const match = newFilename.match(/\.([^.]+)$/);
    
    if (match) {
      // Has extension - update both title and language
      const ext = match[1].toLowerCase();
      const lang = LANGUAGES.find(l => l.ext === ext);
      const title = newFilename.substring(0, newFilename.lastIndexOf('.'));
      
      if (lang) {
        // Valid extension found
        setUiTitle(title);
        setUiLanguage(lang.value);
        
        const updated = { 
          ...selectedSnippet, 
          title, 
          language: lang.value 
        };
        
        // Immediately update the snippet in the store's UI arrays for real-time explorer updates
        const { uiSnippets, uiParentSnippets, openTabs, foundSnippets } = useAppStore.getState();
        
        useAppStore.setState({
          uiSnippets: uiSnippets.map(s => s.id === updated.id ? updated : s),
          uiParentSnippets: uiParentSnippets.map(s => s.id === updated.id ? updated : s),
          openTabs: openTabs.map(tab => tab.id === updated.id ? updated : tab),
          foundSnippets: foundSnippets.map(s => s.id === updated.id ? updated : s),
          selectedSnippet: updated,
          lastSelectedItem: updated
        });
        
        setSaveStatus('unsaved');
        scheduleSave(updated);
      } else {
        // Extension not recognized, just update the title
        setUiTitle(title);
        
        const updated = { 
          ...selectedSnippet, 
          title
        };
        
        const { uiSnippets, uiParentSnippets, openTabs, foundSnippets } = useAppStore.getState();
        
        useAppStore.setState({
          uiSnippets: uiSnippets.map(s => s.id === updated.id ? updated : s),
          uiParentSnippets: uiParentSnippets.map(s => s.id === updated.id ? updated : s),
          openTabs: openTabs.map(tab => tab.id === updated.id ? updated : tab),
          foundSnippets: foundSnippets.map(s => s.id === updated.id ? updated : s),
          selectedSnippet: updated,
          lastSelectedItem: updated
        });
        
        setSaveStatus('unsaved');
        scheduleSave(updated);
      }
    } else {
      // No extension - just update the title, keep current language
      setUiTitle(newFilename);
      
      const updated = { 
        ...selectedSnippet, 
        title: newFilename
      };
      
      const { uiSnippets, uiParentSnippets, openTabs, foundSnippets } = useAppStore.getState();
      
      useAppStore.setState({
        uiSnippets: uiSnippets.map(s => s.id === updated.id ? updated : s),
        uiParentSnippets: uiParentSnippets.map(s => s.id === updated.id ? updated : s),
        openTabs: openTabs.map(tab => tab.id === updated.id ? updated : tab),
        foundSnippets: foundSnippets.map(s => s.id === updated.id ? updated : s),
        selectedSnippet: updated,
        lastSelectedItem: updated
      });
      
      setSaveStatus('unsaved');
      scheduleSave(updated);
    }
  };

  const handleFilenameSubmit = () => {
    setIsEditingFilename(false);
  };

  const handleFilenameBlur = () => {
    setIsEditingFilename(false);
  };

  if (!isHydrated) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-[#858585]">Loading...</div>
      </div>
    );
  }

  if (userTabs.length === 0) {
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

  const lineCount = uiText ? uiText.split("\n").length : 0;
  const charCount = uiText.length;
  const wordCount = uiText ? uiText.trim().split(/\s+/).filter(Boolean).length : 0;
  const Icon = getLanguageIcon(uiLanguage);

  const containerClasses = `${isFullscreen ? "fixed inset-0 z-50" : "h-full"
    } flex flex-col bg-[#1e1e1e]`;

  return (
    <div className={containerClasses}>
      {/* Tab Bar */}
      <div className="h-8.75 bg-[#252526] border-b border-[#3e3e42] flex items-center overflow-x-auto overflow-y-hidden">
        {userTabs.map((tab) => { 
          const isActive = tab.id === activeTabId;
          const hasUnsaved = isActive && saveStatus === 'unsaved';
          const TabIcon = getLanguageIcon(tab.language);

          return (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1 min-w-30 max-w-50 cursor-pointer border-r border-[#252526] ${isActive
                  ? 'bg-[#1e1e1e] border-t-2 border-t-[#007acc] text-[#cccccc]'
                  : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]'
                }`}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
            >
              <TabIcon 
                className="w-4 h-4 shrink-0" 
                style={{ color: getLanguageColor(tab.language) }}
              />
              <span className="flex-1 text-[13px] truncate">{tab.title || "Untitled"}</span>
              {hasUnsaved && <span className="text-[#858585] text-xs">●</span>}
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className="shrink-0 hover:bg-[#3e3e42] p-0.5 rounded-sm transition-colors"
              >
                <VscClose className="w-3 h-3" />
              </button>
            </div>
          );
        })}
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
              <span>{LANGUAGES.find(l => l.value === uiLanguage)?.label || "Plain Text"}</span>
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
                    className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#2a2d2e] transition-colors ${uiLanguage === lang.value ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'
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
            {isFullscreen ? <VscChromeRestore className="w-4 h-4" /> : <VscChromeMaximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Description Area (if exists) */}
      {uiDescription && (
        <div className="bg-[#252526] border-b border-[#3e3e42] px-4 py-2">
          <textarea
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 text-[12px] text-[#cccccc] resize-none focus:outline-none focus:border-[#007acc] placeholder-[#6e6e6e]"
            rows={2}
            value={uiDescription}
            onChange={e => updateField("description", e.target.value)}
            placeholder="Add a description..."
          />
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0">
          <Editor
            key={snippet.id} // Force remount when switching tabs
            language={getMonacoLanguage(uiLanguage)}
            theme="vs-dark"
            value={uiText}
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

          {isEditingFilename ? (
            <input
              ref={filenameInputRef}
              type="text"
              value={editingFilename}
              onChange={(e) => handleFilenameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilenameSubmit();
                if (e.key === 'Escape') setIsEditingFilename(false);
              }}
              onBlur={handleFilenameBlur}
              className="bg-[#0066a8] px-2 py-0.5 text-white text-[11px] border border-white/30 rounded-sm focus:outline-none focus:border-white/60"
            />
          ) : (
            <span 
              className="opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
              onClick={handleFilenameEdit}
              title="Click to edit filename and extension"
            >
              {uiTitle || "Untitled"}.{getFileExtension(uiLanguage)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 opacity-80">
          <span>UTF-8</span>
          <span>{LANGUAGES.find(l => l.value === uiLanguage)?.label || "Plain Text"}</span>
          <span>{userTabs.length} {userTabs.length === 1 ? 'file' : 'files'} open</span>
        </div>
      </div>
    </div>
  );
};