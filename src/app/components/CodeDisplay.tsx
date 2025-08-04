import { BiCode, BiCopy, BiCheck, BiEdit, BiDownload } from "react-icons/bi";
import { Snippet } from "../lib/types";
import { useState } from "react";
import { MarkdownDisplay } from "./MarkdownDisplay";

export const CodeDisplay = ({ snippet }: { snippet?: Snippet }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!snippet?.Text) return;
    
    try {
      await navigator.clipboard.writeText(snippet.Text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!snippet) return;
    
    const element = document.createElement("a");
    const file = new Blob([snippet.Text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${snippet.Title}.${getFileExtension(snippet.Language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileExtension = (language?: string) => {
    const extensions: { [key: string]: string } = {
      JavaScript: 'js',
      TypeScript: 'ts',
      Python: 'py',
      Java: 'java',
      'C++': 'cpp',
      'C#': 'cs',
      C: 'c',
      Kotlin: 'kt',
      'Node.js': 'js'
    };
    return extensions[language || ''] || 'txt';
  };

  const getLanguageBadgeColor = (language?: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: 'badge-warning',
      TypeScript: 'badge-info',
      Python: 'badge-success',
      Java: 'badge-error',
      'C++': 'badge-secondary',
      'C#': 'badge-primary',
      C: 'badge-neutral',
      Kotlin: 'badge-accent',
      'Node.js': 'badge-warning'
    };
    return colors[language || ''] || 'badge-ghost';
  };

  if (!snippet) {
    return (
      <div className="h-full flex items-center justify-center bg-base-100">
        <div className="text-center max-w-md">
          <div className="avatar placeholder mb-6">
            <div className="bg-base-200 text-base-content/30 rounded-full w-24">
              <BiCode className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-base-content mb-3">
            No Snippet Selected
          </h3>
          <p className="text-base-content/70 mb-6">
            Select a code snippet from the sidebar to view and manage your code.
          </p>
          <div className="space-y-2 text-sm text-base-content/60">
            <div className="flex items-center justify-center gap-2">
              <BiCode className="w-4 h-4" />
              <span>View syntax-highlighted code</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BiCopy className="w-4 h-4" />
              <span>Copy code to clipboard</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BiDownload className="w-4 h-4" />
              <span>Download as file</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-base-200 border-b border-base-300">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-lg w-10">
                    <BiCode className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-base-content truncate">
                    {snippet.Title}
                  </h2>
                  {snippet.Language && (
                    <div className={`badge ${getLanguageBadgeColor(snippet.Language)}  badge-sm mt-1`}>
                      {snippet.Language}
                    </div>
                  )}
                </div>
              </div>
              {snippet.Description && (
                <p className="text-base-content/70 text-sm leading-relaxed">
                  {snippet.Description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="tooltip" data-tip="Edit snippet">
                <button className="btn btn-ghost btn-sm btn-square">
                  <BiEdit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="tooltip" data-tip="Download file">
                <button 
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={handleDownload}
                >
                  <BiDownload className="w-4 h-4" />
                </button>
              </div>

              <div className="tooltip" data-tip={copied ? "Copied!" : "Copy to clipboard"}>
                <button
                  className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <BiCheck className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <BiCopy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="mockup-code h-full before:hidden">
            <pre className="px-6 py-4">
              <code className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                <MarkdownDisplay markdown={snippet.Text} />

              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 bg-base-200 border-t border-base-300 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-base-content/60">
          <div className="flex items-center gap-4">
            <span>
              Lines: {snippet.Text.split('\n').length}
            </span>
            <span>
              Characters: {snippet.Text.length}
            </span>
            {snippet.Language && (
              <span>
                Type: {snippet.Language}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};