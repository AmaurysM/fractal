import { BiCode, BiCopy, BiCheck, BiDownload, BiEdit, BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { Snippet } from "../../../types/types";
import { useState, useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const LANGUAGES = [
  { value: "", label: "Select Language", color: "badge-ghost", monaco: "plaintext" },
  { value: "JavaScript", label: "JavaScript", color: "badge-warning", monaco: "javascript" },
  { value: "TypeScript", label: "TypeScript", color: "badge-info", monaco: "typescript" },
  { value: "Python", label: "Python", color: "badge-success", monaco: "python" },
  { value: "Java", label: "Java", color: "badge-error", monaco: "java" },
  { value: "C++", label: "C++", color: "badge-secondary", monaco: "cpp" },
  { value: "C#", label: "C#", color: "badge-primary", monaco: "csharp" },
  { value: "C", label: "C", color: "badge-neutral", monaco: "c" },
  { value: "Kotlin", label: "Kotlin", color: "badge-accent", monaco: "kotlin" },
  { value: "Node.js", label: "Node.js", color: "badge-warning", monaco: "javascript" },
  { value: "HTML", label: "HTML", color: "badge-secondary", monaco: "html" },
  { value: "CSS", label: "CSS", color: "badge-info", monaco: "css" },
  { value: "JSON", label: "JSON", color: "badge-neutral", monaco: "json" },
  { value: "SQL", label: "SQL", color: "badge-primary", monaco: "sql" },
  { value: "PHP", label: "PHP", color: "badge-accent", monaco: "php" },
  { value: "Go", label: "Go", color: "badge-info", monaco: "go" },
  { value: "Rust", label: "Rust", color: "badge-warning", monaco: "rust" },
];

const THEMES = [
  { value: "vs-dark", label: "VS Code Dark" },
  { value: "vs", label: "VS Code Light" },
  { value: "hc-black", label: "High Contrast Dark" },
  { value: "hc-light", label: "High Contrast Light" },
];

export const CodeDisplay = ({
  snippet: initialSnippet,
  onSave,
}: {
  snippet?: Snippet;
  onSave?: (updated: Snippet) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [snippet, setSnippet] = useState<Snippet | undefined>(initialSnippet);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [theme, setTheme] = useState('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    wordWrap: 'on' as const,
    minimap: true,
    lineNumbers: 'on' as const,
  });

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    setSnippet(initialSnippet);
    setSaveStatus('saved');
  }, [initialSnippet]);

  const saveTimeout = useRef<number | null>(null);
  const scheduleSave = (updatedSnippet: Snippet) => {
    setSaveStatus('saving');
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      if (onSave) {
        onSave(updatedSnippet);
        setSaveStatus('saved');
      }
    }, 800);
  };

  const updateField = (field: keyof Snippet, value: string) => {
    if (!snippet) return;
    const updated = { ...snippet, [field]: value };
    setSnippet(updated);
    setSaveStatus('unsaved');
    scheduleSave(updated);
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      wordWrap: editorSettings.wordWrap,
      minimap: { enabled: editorSettings.minimap },
      lineNumbers: editorSettings.lineNumbers,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      contextmenu: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      renderLineHighlight: 'all',
      folding: true,
      showFoldingControls: 'always',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (snippet) {
        onSave?.(snippet);
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
    element.href = URL.createObjectURL(file);
    element.download = `${snippet.title || "snippet"}.${getFileExtension(snippet.language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileExtension = (language?: string) => {
    const extensions: { [key: string]: string } = {
      JavaScript: "js",
      TypeScript: "ts",
      Python: "py",
      Java: "java",
      "C++": "cpp",
      "C#": "cs",
      C: "c",
      Kotlin: "kt",
      "Node.js": "js",
      HTML: "html",
      CSS: "css",
      JSON: "json",
      SQL: "sql",
      PHP: "php",
      Go: "go",
      Rust: "rs",
    };
    return extensions[language || ""] || "txt";
  };

  const getLanguageColor = (language?: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.color || "badge-ghost";
  };

  const getMonacoLanguage = (language?: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.monaco || "plaintext";
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <span className="loading loading-spinner loading-xs"></span>;
      case 'saved':
        return <div className="w-2 h-2 bg-success rounded-full"></div>;
      case 'unsaved':
        return <div className="w-2 h-2 bg-warning rounded-full"></div>;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'unsaved':
        return 'Unsaved';
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const updateEditorSettings = (setting: string, value: any) => {
    const newSettings = { ...editorSettings, [setting]: value };
    setEditorSettings(newSettings);

    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: newSettings.fontSize,
        wordWrap: newSettings.wordWrap,
        minimap: { enabled: newSettings.minimap },
        lineNumbers: newSettings.lineNumbers,
      });
    }
  };

  if (!snippet) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-base-100 to-base-200 p-8">
        <div className="card bg-base-100 shadow-xl p-8 text-center max-w-md">
          <div className="avatar placeholder mb-6">
            <div className="bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center">
              <BiCode className="w-10 h-10" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-base-content mb-4">
            No Snippet Selected
          </h3>
          <p className="text-base-content/70 leading-relaxed">
            Select a code snippet from the sidebar to view, edit, and manage your code with Monaco Editor.
          </p>
        </div>
      </div>
    );
  }

  const text = snippet.text || "";
  const lineCount = text ? text.split("\n").length : 0;
  const charCount = text.length;
  const selectedLanguage = LANGUAGES.find(l => l.value === snippet.language);

  const containerClasses = `${isFullscreen ? "fixed inset-0 z-50" : "h-full"} flex flex-col bg-base-100 min-h-0`;


  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-base-200 to-base-300 border-b border-base-300/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <input
              type="text"
              className="input input-ghost text-2xl font-bold w-full focus:input-primary transition-all duration-200 bg-transparent border-none pl-0 text-base-content"
              value={snippet.title || ""}
              onChange={e => updateField("title", e.target.value)}
              placeholder="Untitled Snippet"
            />
          </div>
          <div className="flex items-center gap-2">
            {selectedLanguage && (
              <div className={`badge ${selectedLanguage.color} badge-lg font-medium`}>
                {selectedLanguage.label}
              </div>
            )}
            <button
              className={`btn btn-sm ${isEditing ? 'btn-primary' : 'btn-ghost'} transition-all duration-200`}
              onClick={() => setIsEditing(!isEditing)}
            >
              <BiEdit className="w-4 h-4" />
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <BiExitFullscreen className="w-4 h-4" /> : <BiFullscreen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="select select-bordered select-primary bg-base-100"
            value={snippet.language || ""}
            onChange={e => updateField("language", e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered bg-base-100"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            {THEMES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 text-sm text-base-content/70">
            <div className="flex items-center gap-1">
              <span className="font-medium">{lineCount}</span>
              <span>lines</span>
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{charCount}</span>
              <span>chars</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer label gap-2">
              <span className="label-text text-xs">Minimap</span>
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={editorSettings.minimap}
                onChange={(e) => updateEditorSettings('minimap', e.target.checked)}
              />
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={editorSettings.fontSize}
              className="range range-xs range-primary"
              onChange={(e) => updateEditorSettings('fontSize', parseInt(e.target.value))}
            />
            <span className="text-xs text-base-content/70">{editorSettings.fontSize}px</span>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4">
            <textarea
              className="textarea textarea-bordered textarea-primary w-full bg-base-100 transition-all duration-200"
              rows={2}
              value={snippet.description || ""}
              onChange={e => updateField("description", e.target.value)}
              placeholder="Add a description for this snippet..."
            />
          </div>
        )}

        {!isEditing && snippet.description && (
          <div className="mt-4 p-3 bg-base-100/50 rounded-lg border border-base-300/30">
            <p className="text-base-content/80 leading-relaxed">{snippet.description}</p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0">
          <Editor
            language={getMonacoLanguage(snippet.language)}
            theme={theme}
            value={snippet.text || ""}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            height="100%"
            options={{
              automaticLayout: true,
              scrollBeyondLastLine: false,
              contextmenu: true,
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              renderLineHighlight: 'all',
              folding: true,
              showFoldingControls: 'always',
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <span className="text-base-content/60">Loading Monaco Editor...</span>
                </div>
              </div>
            }
          />
        </div>
      </div>

      <div className="flex-shrink-0 bg-base-200 border-t border-base-300/50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getSaveStatusIcon()}
              <span className="text-sm font-medium text-base-content/70">
                {getSaveStatusText()}
              </span>
            </div>

            {snippet.language && (
              <div className="text-sm text-base-content/60">
                File: {snippet.title || "untitled"}.{getFileExtension(snippet.language)}
              </div>
            )}

            <div className="text-xs text-base-content/50">
              Ctrl+S to save • Monaco Editor
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`btn btn-sm gap-2 transition-all duration-200 ${copied
                ? "btn-success"
                : "btn-primary hover:btn-primary-focus"
                }`}
              onClick={handleCopy}
              disabled={!text}
            >
              {copied ? (
                <>
                  <BiCheck className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <BiCopy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>

            <button
              className="btn btn-sm btn-ghost gap-2 hover:btn-neutral transition-all duration-200"
              onClick={handleDownload}
              disabled={!text}
            >
              <BiDownload className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};