import { AiOutlineFileText } from "react-icons/ai";
import { FaJava } from "react-icons/fa6";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiC,
  SiKotlin,
  SiHtml5,
  SiCss,
  SiJson,
  SiPhp,
  SiGo,
  SiRust,
  SiSass,
  SiMarkdown,
  SiGraphql,
  SiLua,
  SiSwift,
  SiDart,
  SiRuby,
  SiYaml,
  SiShell,
} from "react-icons/si";
import { TbBrandCSharp, TbSql } from "react-icons/tb";
import { IconType } from "react-icons";


export type LanguageConfig = {
  value: string;
  label: string;
  monaco: string;
  ext: string;
  extensions: string[];
  icon: IconType;
  color: string;
};

export const LANGUAGES: LanguageConfig[] = [
  {
    value: "",
    label: "Plain Text",
    monaco: "plaintext",
    ext: "txt",
    extensions: ["txt"],
    icon: AiOutlineFileText,
    color: "#858585",
  },
  {
    value: "JavaScript",
    label: "JavaScript",
    monaco: "javascript",
    ext: "js",
    extensions: ["js", "mjs", "cjs"],
    icon: SiJavascript,
    color: "#f7df1e",
  },
  {
    value: "TypeScript",
    label: "TypeScript",
    monaco: "typescript",
    ext: "ts",
    extensions: ["ts"],
    icon: SiTypescript,
    color: "#3178c6",
  },
  {
    value: "TypeScript JSX",
    label: "TypeScript JSX",
    monaco: "typescript",
    ext: "tsx",
    extensions: ["tsx"],
    icon: SiTypescript,
    color: "#3178c6",
  },
  {
    value: "JavaScript JSX",
    label: "JavaScript JSX",
    monaco: "javascript",
    ext: "jsx",
    extensions: ["jsx"],
    icon: SiJavascript,
    color: "#f7df1e",
  },
  {
    value: "Python",
    label: "Python",
    monaco: "python",
    ext: "py",
    extensions: ["py", "pyw"],
    icon: SiPython,
    color: "#3776ab",
  },
  {
    value: "Java",
    label: "Java",
    monaco: "java",
    ext: "java",
    extensions: ["java"],
    icon: FaJava,
    color: "#007396",
  },
  {
    value: "C++",
    label: "C++",
    monaco: "cpp",
    ext: "cpp",
    extensions: ["cpp", "cc", "cxx", "c++", "hpp", "hxx"],
    icon: SiCplusplus,
    color: "#00599c",
  },
  {
    value: "C#",
    label: "C#",
    monaco: "csharp",
    ext: "cs",
    extensions: ["cs"],
    icon: TbBrandCSharp,
    color: "#239120",
  },
  {
    value: "C",
    label: "C",
    monaco: "c",
    ext: "c",
    extensions: ["c", "h"],
    icon: SiC,
    color: "#a8b9cc",
  },
  {
    value: "Kotlin",
    label: "Kotlin",
    monaco: "kotlin",
    ext: "kt",
    extensions: ["kt", "kts"],
    icon: SiKotlin,
    color: "#7f52ff",
  },
  {
    value: "Node.js",
    label: "Node.js",
    monaco: "javascript",
    ext: "js",
    extensions: [],
    icon: SiJavascript,
    color: "#339933",
  },
  {
    value: "HTML",
    label: "HTML",
    monaco: "html",
    ext: "html",
    extensions: ["html", "htm"],
    icon: SiHtml5,
    color: "#e34c26",
  },
  {
    value: "CSS",
    label: "CSS",
    monaco: "css",
    ext: "css",
    extensions: ["css"],
    icon: SiCss,
    color: "#1572b6",
  },
  {
    value: "SCSS",
    label: "SCSS",
    monaco: "scss",
    ext: "scss",
    extensions: ["scss"],
    icon: SiSass,
    color: "#c69",
  },
  {
    value: "Sass",
    label: "Sass",
    monaco: "scss",
    ext: "sass",
    extensions: ["sass"],
    icon: SiSass,
    color: "#c69",
  },
  {
    value: "JSON",
    label: "JSON",
    monaco: "json",
    ext: "json",
    extensions: ["json", "jsonc"],
    icon: SiJson,
    color: "#cbcb41",
  },
  {
    value: "SQL",
    label: "SQL",
    monaco: "sql",
    ext: "sql",
    extensions: ["sql"],
    icon: TbSql,
    color: "#e38c00",
  },
  {
    value: "PHP",
    label: "PHP",
    monaco: "php",
    ext: "php",
    extensions: ["php", "php3", "php4", "php5"],
    icon: SiPhp,
    color: "#777bb4",
  },
  {
    value: "Go",
    label: "Go",
    monaco: "go",
    ext: "go",
    extensions: ["go"],
    icon: SiGo,
    color: "#00add8",
  },
  {
    value: "Rust",
    label: "Rust",
    monaco: "rust",
    ext: "rs",
    extensions: ["rs"],
    icon: SiRust,
    color: "#ce4a1a",
  },
  {
    value: "Ruby",
    label: "Ruby",
    monaco: "ruby",
    ext: "rb",
    extensions: ["rb", "erb"],
    icon: SiRuby,
    color: "#cc342d",
  },
  {
    value: "Swift",
    label: "Swift",
    monaco: "swift",
    ext: "swift",
    extensions: ["swift"],
    icon: SiSwift,
    color: "#f05138",
  },
  {
    value: "Dart",
    label: "Dart",
    monaco: "dart",
    ext: "dart",
    extensions: ["dart"],
    icon: SiDart,
    color: "#00b4ab",
  },
  {
    value: "Markdown",
    label: "Markdown",
    monaco: "markdown",
    ext: "md",
    extensions: ["md", "mdx"],
    icon: SiMarkdown,
    color: "#519aba",
  },
  {
    value: "YAML",
    label: "YAML",
    monaco: "yaml",
    ext: "yaml",
    extensions: ["yaml", "yml"],
    icon: SiYaml,
    color: "#cbcb41",
  },
  {
    value: "Shell",
    label: "Shell",
    monaco: "shell",
    ext: "sh",
    extensions: ["sh", "bash", "zsh", "fish"],
    icon: SiShell,
    color: "#4eaa25",
  },
  {
    value: "GraphQL",
    label: "GraphQL",
    monaco: "graphql",
    ext: "graphql",
    extensions: ["graphql", "gql"],
    icon: SiGraphql,
    color: "#e10098",
  },
  {
    value: "Lua",
    label: "Lua",
    monaco: "lua",
    ext: "lua",
    extensions: ["lua"],
    icon: SiLua,
    color: "#000080",
  },
];

const _extMap = new Map<string, LanguageConfig>();

for (const lang of LANGUAGES) {
  for (const ext of lang.extensions) {
    if (!_extMap.has(ext)) {
      _extMap.set(ext, lang);
    }
  }
}

const _bareMap = new Map<string, LanguageConfig>([
  ["dockerfile", LANGUAGES.find((l) => l.value === "Shell")!],
  ["makefile", LANGUAGES.find((l) => l.value === "Shell")!],
  ["gnumakefile", LANGUAGES.find((l) => l.value === "Shell")!],
]);

export function inferLanguageFromTitle(title: string): LanguageConfig | undefined {
  if (!title) return undefined;

  const lower = title.toLowerCase();

  if (_bareMap.has(lower)) return _bareMap.get(lower);

  if (lower === ".env" || lower.startsWith(".env.")) {
    return LANGUAGES.find((l) => l.value === "Shell");
  }

  const dotIndex = lower.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === lower.length - 1) return undefined;

  const ext = lower.slice(dotIndex + 1);
  return _extMap.get(ext);
}

export function getLanguageConfig(language?: string): LanguageConfig {
  return LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];
}

export function getLanguageIcon(language?: string): IconType {
  return getLanguageConfig(language).icon;
}

export function getLanguageColor(language?: string): string {
  return getLanguageConfig(language).color;
}

export function getFileExtension(language?: string): string {
  return getLanguageConfig(language).ext;
}

export function getMonacoLanguage(language?: string): string {
  return getLanguageConfig(language).monaco;
}