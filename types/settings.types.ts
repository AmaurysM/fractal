export enum SettingTabs {
  USER = "user",
  CODE = "code",
}

export enum UserSettings {
  USERNAME = "username",
  FIRST_NAME = "first_name",
  LAST_NAME = "last_name",
  // EMAIL = "email",
  // PASSWORD = "password",
}

export enum CodeSettings {
  FONT_FAMILY = "font family",
  FONT_SIZE = "font size",
  LINE_HEIGHT = "line height",
  FONT_LIGATURES = "font ligatures",
  TAB_SIZE = "tab size",

  INSERT_SPACES = "insert spaces",
  WORD_WRAP = "word wrap",
  AUTO_CLOSING_BRACKETS = "auto closing brackets",
  AUTO_CLOSING_QUOTES = "auto closing quotes",

  FORMAT_ON_PASTE = "format on paste",
  FORMAT_ON_TYPE = "format on type",

  THEME = "theme",

  LINE_NUMBERS = "line numbers",
  RENDER_WHITESPACE = "render whitespace",
  SHOW_MINIMAP = "show minimap",
  MINIMAP_SIDE = "minimap side",
  RENDER_LINE_HIGHLIGHT = "render line highlight",
  BRACKET_PAIR_COLORIZATION = "bracket pair colorization",
  INDENT_GUIDES = "indent guides",

  SMOOTH_SCROLLING = "smooth scrolling",

  CURSOR_BLINKING = "cursor blinking",
  CURSOR_STYLE = "cursor style",
  CURSOR_SMOOTH_CARET = "cursor smooth caret",

  SCROLL_BEYOND_LAST_LINE = "scroll beyond last line",

  FOLDING = "folding",
  SHOW_FOLDING_CONTROLS = "show folding controls",

  AUTO_SAVE_DELAY = "auto save delay",
}

export type AllSettings = UserSettings | CodeSettings;

export interface SettingSection {
  label: string;
  settings: AllSettings[];
}