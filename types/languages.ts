import { AiOutlineFileText } from "react-icons/ai";
import { FaJava } from "react-icons/fa6";
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiC, SiKotlin, SiHtml5, SiCss3, SiJson, SiPhp, SiGo, SiRust } from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";

export const LANGUAGES = [
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

export const getLanguageConfig = (language?: string) => {
    return LANGUAGES.find(l => l.value === language) || LANGUAGES[0];
};

export const getLanguageIcon = (language?: string) => {
  const lang = LANGUAGES.find(l => l.value === language);
  return lang?.icon || AiOutlineFileText;
};

export const getLanguageColor = (language?: string) => {
  const lang = LANGUAGES.find(l => l.value === language);
  return lang?.color || "#858585";
};

export const getFileExtension = (language?: string) => {
  const lang = LANGUAGES.find(l => l.value === language);
  return lang?.ext || "txt";
};

export const getMonacoLanguage = (language?: string) => {
  const lang = LANGUAGES.find(l => l.value === language);
  return lang?.monaco || "plaintext";
};
