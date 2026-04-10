import { JSX } from "react";
import {
  AllSettings,
  CodeSettings,
  SettingSection,
  SettingTabs,
  UserSettings,
} from "./settings.types";
import {
  AppSettings,
  CursorBlinkingValue,
  CursorStyleValue,
  EditorSettings,
  LineNumbersValue,
  MinimapSideValue,
  RenderLineHighlightValue,
  RenderWhitespaceValue,
  ShowFoldingControlsValue,
  ThemeValue,
  UserSettings as AppUserSettings,
  WordWrapValue,
} from "./types";

export const TAB_SECTIONS: Record<SettingTabs, SettingSection[]> = {
  [SettingTabs.USER]: [
    { label: "Account", settings: [UserSettings.USERNAME, UserSettings.EMAIL] },
    { label: "Security", settings: [UserSettings.PASSWORD] },
  ],
  [SettingTabs.CODE]: [
    {
      label: "Typography",
      settings: [
        CodeSettings.FONT_FAMILY, CodeSettings.FONT_SIZE, CodeSettings.LINE_HEIGHT,
        CodeSettings.FONT_LIGATURES, CodeSettings.TAB_SIZE,
      ],
    },
    {
      label: "Editing",
      settings: [
        CodeSettings.INSERT_SPACES, CodeSettings.WORD_WRAP,
        CodeSettings.AUTO_CLOSING_BRACKETS, CodeSettings.AUTO_CLOSING_QUOTES,
      ],
    },
    { label: "Formatting", settings: [CodeSettings.FORMAT_ON_PASTE, CodeSettings.FORMAT_ON_TYPE] },
    {
      label: "Appearance",
      settings: [
        CodeSettings.THEME, CodeSettings.LINE_NUMBERS, CodeSettings.RENDER_WHITESPACE,
        CodeSettings.SHOW_MINIMAP, CodeSettings.MINIMAP_SIDE, CodeSettings.RENDER_LINE_HIGHLIGHT,
        CodeSettings.BRACKET_PAIR_COLORIZATION, CodeSettings.INDENT_GUIDES,
      ],
    },
    { label: "Scrolling", settings: [CodeSettings.SMOOTH_SCROLLING, CodeSettings.SCROLL_BEYOND_LAST_LINE] },
    {
      label: "Cursor",
      settings: [CodeSettings.CURSOR_BLINKING, CodeSettings.CURSOR_STYLE, CodeSettings.CURSOR_SMOOTH_CARET],
    },
    { label: "Folding", settings: [CodeSettings.FOLDING, CodeSettings.SHOW_FOLDING_CONTROLS] },
    { label: "Save", settings: [CodeSettings.AUTO_SAVE_DELAY] },
  ],
};

export const DropMenuOptions: Record<SettingTabs, AllSettings[]> = {
  [SettingTabs.USER]: TAB_SECTIONS[SettingTabs.USER].flatMap((s) => s.settings),
  [SettingTabs.CODE]: TAB_SECTIONS[SettingTabs.CODE].flatMap((s) => s.settings),
};

export const getAllSettings = (): AllSettings[] => [
  ...TAB_SECTIONS[SettingTabs.USER].flatMap((s) => s.settings),
  ...TAB_SECTIONS[SettingTabs.CODE].flatMap((s) => s.settings),
];

const inputCls = `
  w-44 bg-[#1a1a1a] border border-[#3a3a3a] rounded
  text-[12px] text-[#d4d4d4] placeholder-[#555]
  px-2 py-1 focus:outline-none focus:border-[#6a9fd8]
  transition-colors duration-150
`;

const selectCls = `
  w-44 bg-[#1a1a1a] border border-[#3a3a3a] rounded
  text-[12px] text-[#d4d4d4]
  px-2 py-1 focus:outline-none focus:border-[#6a9fd8]
  transition-colors duration-150 cursor-pointer
`;

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const TextInput = (props: TextInputProps) => <input {...props} className={inputCls} />;

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
const Toggle = ({ checked, onChange }: ToggleProps) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className="
      w-8 h-4 bg-[#3a3a3a] rounded-full peer
      peer-checked:bg-[#6a9fd8]
      after:content-[''] after:absolute after:top-0.5 after:left-0.5
      after:bg-white after:rounded-full after:h-3 after:w-3
      after:transition-all peer-checked:after:translate-x-4
    " />
  </label>
);

interface SelectProps<T extends string> {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}
function ControlledSelect<T extends string>({ value, options, onChange }: SelectProps<T>) {
  return (
    <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Pending state types — partial patches that accumulate until the user saves
export interface PendingChanges {
  user: Partial<Omit<AppUserSettings, "id" | "email" | "image">>;
  editor: Partial<Omit<EditorSettings, "id">>;
}

interface Callbacks {
  // These now write to pending state, not directly to the store
  updatePendingUser: (patch: Partial<Omit<AppUserSettings, "id" | "email" | "image">>) => void;
  updatePendingEditor: (patch: Partial<Omit<EditorSettings, "id">>) => void;
}

// Merged view: committed settings overridden by any pending changes
function mergedUser(
  u: AppUserSettings | undefined,
  pending: PendingChanges
): AppUserSettings | undefined {
  if (!u) return u;
  return { ...u, ...pending.user };
}

function mergedEditor(
  e: EditorSettings | undefined,
  pending: PendingChanges
): EditorSettings | undefined {
  if (!e) return e;
  return { ...e, ...pending.editor };
}

export function buildOptionResolver(
  settings: AppSettings | null,
  pending: PendingChanges,
  { updatePendingUser, updatePendingEditor }: Callbacks
): Record<AllSettings, () => JSX.Element> {

  const u = mergedUser(settings?.user, pending);
  const e = mergedEditor(settings?.editor, pending);

  const str = (val: string | undefined, fallback = "") => val ?? fallback;
  const num = (val: number | undefined, fallback = 0) => val ?? fallback;
  const bool = (val: boolean | undefined, fallback = false): boolean => val ?? fallback;

  return {
    [UserSettings.USERNAME]: () => (
      <TextInput
        placeholder="Username"
        value={str(u?.username)}
        autoComplete="off"
        onChange={(ev) => updatePendingUser({ username: ev.target.value })}
      />
    ),
    [UserSettings.EMAIL]: () => (
      <TextInput
        type="email"
        placeholder="Email"
        value={str(u?.email)}
        autoComplete="off"
        disabled
        title="Email cannot be changed"
      />
    ),
    [UserSettings.PASSWORD]: () => (
      <TextInput
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        readOnly
        onFocus={(e) => (e.target.readOnly = false)}
        onChange={(ev) => updatePendingUser({ password: ev.target.value } as any)}
      />
    ),

    [CodeSettings.FONT_FAMILY]: () => (
      <TextInput
        placeholder="e.g. Fira Code"
        value={str(e?.fontFamily)}
        onChange={(ev) => updatePendingEditor({ fontFamily: ev.target.value })}
      />
    ),
    [CodeSettings.FONT_SIZE]: () => (
      <TextInput
        type="number"
        placeholder="13"
        value={num(e?.fontSize)}
        onChange={(ev) => updatePendingEditor({ fontSize: Number(ev.target.value) })}
      />
    ),
    [CodeSettings.LINE_HEIGHT]: () => (
      <TextInput
        type="number"
        step="0.1"
        placeholder="20"
        value={num(e?.lineHeight)}
        onChange={(ev) => updatePendingEditor({ lineHeight: Number(ev.target.value) })}
      />
    ),
    [CodeSettings.FONT_LIGATURES]: () => (
      <Toggle
        checked={bool(e?.fontLigatures)}
        onChange={(v) => updatePendingEditor({ fontLigatures: v })}
      />
    ),
    [CodeSettings.TAB_SIZE]: () => (
      <TextInput
        type="number"
        placeholder="2"
        value={num(e?.tabSize)}
        onChange={(ev) => updatePendingEditor({ tabSize: Number(ev.target.value) })}
      />
    ),

    [CodeSettings.INSERT_SPACES]: () => (
      <Toggle checked={bool(e?.insertSpaces)} onChange={(v) => updatePendingEditor({ insertSpaces: v })} />
    ),
    [CodeSettings.WORD_WRAP]: () => (
      <ControlledSelect<WordWrapValue>
        value={e?.wordWrap ?? "off"}
        options={[
          { label: "Off", value: "off" },
          { label: "On", value: "on" },
          { label: "Word Wrap Column", value: "wordWrapColumn" },
          { label: "Bounded", value: "bounded" },
        ]}
        onChange={(v) => updatePendingEditor({ wordWrap: v })}
      />
    ),
    [CodeSettings.AUTO_CLOSING_BRACKETS]: () => (
      <Toggle checked={bool(e?.autoClosingBrackets)} onChange={(v) => updatePendingEditor({ autoClosingBrackets: v })} />
    ),
    [CodeSettings.AUTO_CLOSING_QUOTES]: () => (
      <Toggle checked={bool(e?.autoClosingQuotes)} onChange={(v) => updatePendingEditor({ autoClosingQuotes: v })} />
    ),

    [CodeSettings.FORMAT_ON_PASTE]: () => (
      <Toggle checked={bool(e?.formatOnPaste)} onChange={(v) => updatePendingEditor({ formatOnPaste: v })} />
    ),
    [CodeSettings.FORMAT_ON_TYPE]: () => (
      <Toggle checked={bool(e?.formatOnType)} onChange={(v) => updatePendingEditor({ formatOnType: v })} />
    ),

    [CodeSettings.THEME]: () => (
      <ControlledSelect<ThemeValue>
        value={e?.theme ?? "vs-dark"}
        options={[
          { label: "Dark", value: "vs-dark" },
          { label: "Light", value: "vs-light" },
          { label: "High Contrast", value: "hc-black" },
        ]}
        onChange={(v) => updatePendingEditor({ theme: v })}
      />
    ),
    [CodeSettings.LINE_NUMBERS]: () => (
      <ControlledSelect<LineNumbersValue>
        value={e?.lineNumbers ?? "on"}
        options={[
          { label: "On", value: "on" },
          { label: "Off", value: "off" },
          { label: "Relative", value: "relative" },
          { label: "Interval", value: "interval" },
        ]}
        onChange={(v) => updatePendingEditor({ lineNumbers: v })}
      />
    ),
    [CodeSettings.RENDER_WHITESPACE]: () => (
      <ControlledSelect<RenderWhitespaceValue>
        value={e?.renderWhitespace ?? "none"}
        options={[
          { label: "None", value: "none" },
          { label: "Boundary", value: "boundary" },
          { label: "Selection", value: "selection" },
          { label: "Trailing", value: "trailing" },
          { label: "All", value: "all" },
        ]}
        onChange={(v) => updatePendingEditor({ renderWhitespace: v })}
      />
    ),
    [CodeSettings.SHOW_MINIMAP]: () => (
      <Toggle checked={bool(e?.showMinimap)} onChange={(v) => updatePendingEditor({ showMinimap: v })} />
    ),
    [CodeSettings.MINIMAP_SIDE]: () => (
      <ControlledSelect<MinimapSideValue>
        value={e?.minimapSide ?? "right"}
        options={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
        onChange={(v) => updatePendingEditor({ minimapSide: v })}
      />
    ),
    [CodeSettings.RENDER_LINE_HIGHLIGHT]: () => (
      <ControlledSelect<RenderLineHighlightValue>
        value={e?.renderLineHighlight ?? "all"}
        options={[
          { label: "None", value: "none" },
          { label: "Gutter", value: "gutter" },
          { label: "Line", value: "line" },
          { label: "All", value: "all" },
        ]}
        onChange={(v) => updatePendingEditor({ renderLineHighlight: v })}
      />
    ),
    [CodeSettings.BRACKET_PAIR_COLORIZATION]: () => (
      <Toggle checked={bool(e?.bracketPairColorization)} onChange={(v) => updatePendingEditor({ bracketPairColorization: v })} />
    ),
    [CodeSettings.INDENT_GUIDES]: () => (
      <Toggle checked={bool(e?.indentGuides)} onChange={(v) => updatePendingEditor({ indentGuides: v })} />
    ),

    [CodeSettings.SMOOTH_SCROLLING]: () => (
      <Toggle checked={bool(e?.smoothScrolling)} onChange={(v) => updatePendingEditor({ smoothScrolling: v })} />
    ),
    [CodeSettings.SCROLL_BEYOND_LAST_LINE]: () => (
      <Toggle checked={bool(e?.scrollBeyondLastLine)} onChange={(v) => updatePendingEditor({ scrollBeyondLastLine: v })} />
    ),

    [CodeSettings.CURSOR_BLINKING]: () => (
      <ControlledSelect<CursorBlinkingValue>
        value={e?.cursorBlinking ?? "blink"}
        options={[
          { label: "Blink", value: "blink" },
          { label: "Smooth", value: "smooth" },
          { label: "Phase", value: "phase" },
          { label: "Expand", value: "expand" },
          { label: "Solid", value: "solid" },
        ]}
        onChange={(v) => updatePendingEditor({ cursorBlinking: v })}
      />
    ),
    [CodeSettings.CURSOR_STYLE]: () => (
      <ControlledSelect<CursorStyleValue>
        value={e?.cursorStyle ?? "line"}
        options={[
          { label: "Line", value: "line" },
          { label: "Block", value: "block" },
          { label: "Underline", value: "underline" },
          { label: "Line Thin", value: "line-thin" },
          { label: "Block Outline", value: "block-outline" },
          { label: "Underline Thin", value: "underline-thin" },
        ]}
        onChange={(v) => updatePendingEditor({ cursorStyle: v })}
      />
    ),
    [CodeSettings.CURSOR_SMOOTH_CARET]: () => (
      <Toggle checked={bool(e?.cursorSmoothCaretAnimation)} onChange={(v) => updatePendingEditor({ cursorSmoothCaretAnimation: v })} />
    ),

    [CodeSettings.FOLDING]: () => (
      <Toggle checked={bool(e?.folding)} onChange={(v) => updatePendingEditor({ folding: v })} />
    ),
    [CodeSettings.SHOW_FOLDING_CONTROLS]: () => (
      <ControlledSelect<ShowFoldingControlsValue>
        value={e?.showFoldingControls ?? "mouseover"}
        options={[
          { label: "Always", value: "always" },
          { label: "Mouse Over", value: "mouseover" },
        ]}
        onChange={(v) => updatePendingEditor({ showFoldingControls: v })}
      />
    ),

    [CodeSettings.AUTO_SAVE_DELAY]: () => (
      <TextInput
        type="number"
        placeholder="800"
        value={num(e?.autoSaveDelay)}
        onChange={(ev) => updatePendingEditor({ autoSaveDelay: Number(ev.target.value) })}
      />
    ),
  };
}