import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiC, SiKotlin, SiHtml5, SiCss3, SiJson, SiPhp, SiGo, SiRust } from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { TbBrandCSharp } from "react-icons/tb";

import { AiOutlineFileText } from "react-icons/ai";
import { BiFolder } from "react-icons/bi";

const LANGUAGE_CONFIG = [
  { value: "", icon: AiOutlineFileText, ext: "txt", color: "#858585" },
  { value: "JavaScript", icon: SiJavascript, ext: "js", color: "#f7df1e" },
  { value: "TypeScript", icon: SiTypescript, ext: "ts", color: "#3178c6" },
  { value: "Python", icon: SiPython, ext: "py", color: "#3776ab" },
  { value: "Java", icon: FaJava, ext: "java", color: "#007396" },
  { value: "C++", icon: SiCplusplus, ext: "cpp", color: "#00599c" },
  { value: "C#", icon: TbBrandCSharp, ext: "cs", color: "#239120" },
  { value: "C", icon: SiC, ext: "c", color: "#a8b9cc" },
  { value: "Kotlin", icon: SiKotlin, ext: "kt", color: "#7f52ff" },
  { value: "Node.js", icon: SiJavascript, ext: "js", color: "#339933" },
  { value: "HTML", icon: SiHtml5, ext: "html", color: "#e34c26" },
  { value: "CSS", icon: SiCss3, ext: "css", color: "#1572b6" },
  { value: "JSON", icon: SiJson, ext: "json", color: "#000000" },
  { value: "SQL", icon: AiOutlineFileText, ext: "sql", color: "#e38c00" },
  { value: "PHP", icon: SiPhp, ext: "php", color: "#777bb4" },
  { value: "Go", icon: SiGo, ext: "go", color: "#00add8" },
  { value: "Rust", icon: SiRust, ext: "rs", color: "#000000" },
];

const detectLanguageFromExtension = (filename: string): { language: string; ext: string } | null => {
  const match = filename.match(/\.([^.]+)$/);
  if (!match) return null;
  
  const ext = match[1].toLowerCase();
  const config = LANGUAGE_CONFIG.find(l => l.ext === ext);
  
  return config ? { language: config.value, ext: config.ext } : null;
};

const getLanguageConfigFromExt = (ext: string) => {
  return LANGUAGE_CONFIG.find(l => l.ext === ext.toLowerCase()) || LANGUAGE_CONFIG[0];
};

export const ItemCreation = (
    {
        addingItemName,
        setAddingItemName,
        handleAddItemSumit,
        handleAddItemCancel,
        isFolder = false,
    }:{
        addingItemName: string;
        setAddingItemName: (name: string) => void;
        handleAddItemSumit: (detectedLanguage?: string) => void;
        handleAddItemCancel: () => void;
        isFolder?: boolean;
    }
) => {
    // Detect language from file extension for files
    const detectedLang = !isFolder ? detectLanguageFromExtension(addingItemName) : null;
    const langConfig = detectedLang ? getLanguageConfigFromExt(detectedLang.ext) : LANGUAGE_CONFIG[0];
    const Icon = isFolder ? BiFolder : langConfig.icon;

    const handleSubmit = () => {
        if (!isFolder && detectedLang) {
            // Pass detected language to parent
            handleAddItemSumit(detectedLang.language);
        } else {
            handleAddItemSumit();
        }
    };

    return (
        <div className="bg-[#252526] border-l-2 border-[#007acc]">
            <div className="flex items-center gap-2 py-1 px-2">
                <Icon 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ 
                        color: isFolder ? '#dcb67a' : langConfig.color 
                    }}
                />
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={addingItemName}
                        onChange={(e) => setAddingItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSubmit();
                            } else if (e.key === "Escape") {
                                handleAddItemCancel();
                            }
                        }}
                        onBlur={handleAddItemCancel}
                        autoFocus
                        placeholder={isFolder ? "Folder name" : "filename.ext"}
                        className="w-full px-2 py-0.5 text-[13px] bg-[#1e1e1e] border border-[#007acc] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#007acc] text-[#cccccc]"
                    />
                </div>
                {!isFolder && detectedLang && (
                    <span className="text-[11px] text-[#858585] flex-shrink-0">
                        .{detectedLang.ext}
                    </span>
                )}
            </div>
        </div>
    )
}