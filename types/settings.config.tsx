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
    {
      label: "Profile",
      settings: [
        UserSettings.FIRST_NAME,
        UserSettings.LAST_NAME,
        UserSettings.USERNAME,
      ],
    },
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
  w-full sm:w-44 bg-[#1a1a1a] border border-[#3a3a3a] rounded
  text-[12px] text-[#d4d4d4] placeholder-[#555]
  px-2 py-2 sm:py-1 focus:outline-none focus:border-[#6a9fd8]
  transition-colors duration-150
`;

const selectCls = `
  w-full sm:w-44 bg-[#1a1a1a] border border-[#3a3a3a] rounded
  text-[12px] text-[#d4d4d4]
  px-2 py-2 sm:py-1 focus:outline-none focus:border-[#6a9fd8]
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

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}
const Stepper = ({ value, onChange, min, max, step = 1 }: StepperProps) => {
  const decrement = () => {
    const next = Math.round((value - step) * 1000) / 1000;
    if (min !== undefined && next < min) return;
    onChange(next);
  };
  const increment = () => {
    const next = Math.round((value + step) * 1000) / 1000;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <div className="flex items-center w-full sm:w-44 bg-[#1a1a1a] border border-[#3a3a3a] rounded overflow-hidden focus-within:border-[#6a9fd8] transition-colors duration-150">
      <button
        type="button"
        onClick={decrement}
        className="w-7 py-2 sm:py-1 flex items-center justify-center text-[#555] hover:text-[#ccc] hover:bg-[#252525] active:bg-[#2f2f2f] transition-colors duration-100 shrink-0 border-r border-[#3a3a3a] cursor-pointer select-none text-[15px] leading-none"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          flex-1 min-w-0 bg-transparent text-[12px] text-[#d4d4d4]
          text-center py-2 sm:py-1 focus:outline-none
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
      />
      <button
        type="button"
        onClick={increment}
        className="w-7 py-2 sm:py-1 flex items-center justify-center text-[#555] hover:text-[#ccc] hover:bg-[#252525] active:bg-[#2f2f2f] transition-colors duration-100 shrink-0 border-l border-[#3a3a3a] cursor-pointer select-none text-[15px] leading-none"
      >
        +
      </button>
    </div>
  );
};

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

export interface PendingChanges {
  user: Partial<Omit<AppUserSettings, "id" | "email" | "image">>;
  editor: Partial<Omit<EditorSettings, "id">>;
}

interface Callbacks {
  updatePendingUser: (patch: Partial<Omit<AppUserSettings, "id" | "email" | "image">>) => void;
  updatePendingEditor: (patch: Partial<Omit<EditorSettings, "id">>) => void;
}

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
        value={str(u?.username ?? "")}
        autoComplete="off"
        onChange={(ev) => updatePendingUser({ username: ev.target.value })}
      />
    ),
    [UserSettings.FIRST_NAME]: () => (
      <TextInput
        placeholder="First name"
        value={str(u?.first_name ?? undefined)}
        autoComplete="off"
        onChange={(ev) => updatePendingUser({ first_name: ev.target.value } as any)}
      />
    ),
    [UserSettings.LAST_NAME]: () => (
      <TextInput
        placeholder="Last name"
        value={str(u?.last_name ?? undefined)}
        autoComplete="off"
        onChange={(ev) => updatePendingUser({ last_name: ev.target.value } as any)}
      />
    ),

    [CodeSettings.FONT_FAMILY]: () => (
      <TextInput
        placeholder="e.g. Fira Code"
        value={str(e?.font_family)}
        onChange={(ev) => updatePendingEditor({ font_family: ev.target.value })}
      />
    ),
    [CodeSettings.FONT_SIZE]: () => (
      <Stepper
        value={num(e?.font_size, 13)}
        min={8}
        max={32}
        step={1}
        onChange={(v) => updatePendingEditor({ font_size: v })}
      />
    ),
    [CodeSettings.LINE_HEIGHT]: () => (
      <Stepper
        value={num(e?.line_height, 20)}
        min={10}
        max={60}
        step={1}
        onChange={(v) => updatePendingEditor({ line_height: v })}
      />
    ),
    [CodeSettings.FONT_LIGATURES]: () => (
      <Toggle
        checked={bool(e?.font_ligatures)}
        onChange={(v) => updatePendingEditor({ font_ligatures: v })}
      />
    ),
    [CodeSettings.TAB_SIZE]: () => (
      <Stepper
        value={num(e?.tab_size, 2)}
        min={1}
        max={8}
        step={1}
        onChange={(v) => updatePendingEditor({ tab_size: v })}
      />
    ),

    [CodeSettings.INSERT_SPACES]: () => (
      <Toggle checked={bool(e?.insert_spaces)} onChange={(v) => updatePendingEditor({ insert_spaces: v })} />
    ),
    [CodeSettings.WORD_WRAP]: () => (
      <ControlledSelect<WordWrapValue>
        value={e?.word_wrap ?? "off"}
        options={[
          { label: "Off", value: "off" },
          { label: "On", value: "on" },
          { label: "Word Wrap Column", value: "wordWrapColumn" },
          { label: "Bounded", value: "bounded" },
        ]}
        onChange={(v) => updatePendingEditor({ word_wrap: v })}
      />
    ),
    [CodeSettings.AUTO_CLOSING_BRACKETS]: () => (
      <Toggle checked={bool(e?.auto_closing_brackets)} onChange={(v) => updatePendingEditor({ auto_closing_brackets: v })} />
    ),
    [CodeSettings.AUTO_CLOSING_QUOTES]: () => (
      <Toggle checked={bool(e?.auto_closing_quotes)} onChange={(v) => updatePendingEditor({ auto_closing_quotes: v })} />
    ),

    [CodeSettings.FORMAT_ON_PASTE]: () => (
      <Toggle checked={bool(e?.format_on_paste)} onChange={(v) => updatePendingEditor({ format_on_paste: v })} />
    ),
    [CodeSettings.FORMAT_ON_TYPE]: () => (
      <Toggle checked={bool(e?.format_on_type)} onChange={(v) => updatePendingEditor({ format_on_type: v })} />
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
        value={e?.line_numbers ?? "on"}
        options={[
          { label: "On", value: "on" },
          { label: "Off", value: "off" },
          { label: "Relative", value: "relative" },
          { label: "Interval", value: "interval" },
        ]}
        onChange={(v) => updatePendingEditor({ line_numbers: v })}
      />
    ),
    [CodeSettings.RENDER_WHITESPACE]: () => (
      <ControlledSelect<RenderWhitespaceValue>
        value={e?.render_whitespace ?? "none"}
        options={[
          { label: "None", value: "none" },
          { label: "Boundary", value: "boundary" },
          { label: "Selection", value: "selection" },
          { label: "Trailing", value: "trailing" },
          { label: "All", value: "all" },
        ]}
        onChange={(v) => updatePendingEditor({ render_whitespace: v })}
      />
    ),
    [CodeSettings.SHOW_MINIMAP]: () => (
      <Toggle checked={bool(e?.show_minimap)} onChange={(v) => updatePendingEditor({ show_minimap: v })} />
    ),
    [CodeSettings.MINIMAP_SIDE]: () => (
      <ControlledSelect<MinimapSideValue>
        value={e?.minimap_side ?? "right"}
        options={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
        onChange={(v) => updatePendingEditor({ minimap_side: v })}
      />
    ),
    [CodeSettings.RENDER_LINE_HIGHLIGHT]: () => (
      <ControlledSelect<RenderLineHighlightValue>
        value={e?.render_line_highlight ?? "all"}
        options={[
          { label: "None", value: "none" },
          { label: "Gutter", value: "gutter" },
          { label: "Line", value: "line" },
          { label: "All", value: "all" },
        ]}
        onChange={(v) => updatePendingEditor({ render_line_highlight: v })}
      />
    ),
    [CodeSettings.BRACKET_PAIR_COLORIZATION]: () => (
      <Toggle checked={bool(e?.bracket_pair_colorization)} onChange={(v) => updatePendingEditor({ bracket_pair_colorization: v })} />
    ),
    [CodeSettings.INDENT_GUIDES]: () => (
      <Toggle checked={bool(e?.indent_guides)} onChange={(v) => updatePendingEditor({ indent_guides: v })} />
    ),

    [CodeSettings.SMOOTH_SCROLLING]: () => (
      <Toggle checked={bool(e?.smooth_scrolling)} onChange={(v) => updatePendingEditor({ smooth_scrolling: v })} />
    ),
    [CodeSettings.SCROLL_BEYOND_LAST_LINE]: () => (
      <Toggle checked={bool(e?.scroll_beyond_last_line)} onChange={(v) => updatePendingEditor({ scroll_beyond_last_line: v })} />
    ),

    [CodeSettings.CURSOR_BLINKING]: () => (
      <ControlledSelect<CursorBlinkingValue>
        value={e?.cursor_blinking ?? "blink"}
        options={[
          { label: "Blink", value: "blink" },
          { label: "Smooth", value: "smooth" },
          { label: "Phase", value: "phase" },
          { label: "Expand", value: "expand" },
          { label: "Solid", value: "solid" },
        ]}
        onChange={(v) => updatePendingEditor({ cursor_blinking: v })}
      />
    ),
    [CodeSettings.CURSOR_STYLE]: () => (
      <ControlledSelect<CursorStyleValue>
        value={e?.cursor_style ?? "line"}
        options={[
          { label: "Line", value: "line" },
          { label: "Block", value: "block" },
          { label: "Underline", value: "underline" },
          { label: "Line Thin", value: "line-thin" },
          { label: "Block Outline", value: "block-outline" },
          { label: "Underline Thin", value: "underline-thin" },
        ]}
        onChange={(v) => updatePendingEditor({ cursor_style: v })}
      />
    ),
    [CodeSettings.CURSOR_SMOOTH_CARET]: () => (
      <ControlledSelect<"on" | "off" | "explicit">
        value={e?.cursor_smooth_caret_animation ?? "off"}
        options={[
          { label: "Off", value: "off" },
          { label: "On", value: "on" },
          { label: "Explicit", value: "explicit" },
        ]}
        onChange={(v) => updatePendingEditor({ cursor_smooth_caret_animation: v })}
      />
    ),

    [CodeSettings.FOLDING]: () => (
      <Toggle checked={bool(e?.folding)} onChange={(v) => updatePendingEditor({ folding: v })} />
    ),
    [CodeSettings.SHOW_FOLDING_CONTROLS]: () => (
      <ControlledSelect<ShowFoldingControlsValue>
        value={e?.show_folding_controls ?? "mouseover"}
        options={[
          { label: "Always", value: "always" },
          { label: "Mouse Over", value: "mouseover" },
        ]}
        onChange={(v) => updatePendingEditor({ show_folding_controls: v })}
      />
    ),

    [CodeSettings.AUTO_SAVE_DELAY]: () => (
      <Stepper
        value={num(e?.auto_save_delay, 800)}
        min={100}
        max={10000}
        step={100}
        onChange={(v) => updatePendingEditor({ auto_save_delay: v })}
      />
    ),
  };
}