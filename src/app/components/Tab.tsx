import { VscClose } from "react-icons/vsc";
import { useLibraryStore } from "../store/libraryStore";
import { useTabStore } from "../store/tabStore";
import { getLanguageColor, getLanguageIcon } from "../../../types/languages";

export const Tab = ({
  tabId,
  isActive,
}: {
  tabId: string;
  isActive: boolean;
}) => {
  const tabSnip = useTabStore((state) => state.tabs.find((t) => t.id === tabId));
  const { setSelectedItem } = useLibraryStore();
  const { closeTab } = useTabStore();

  const Icon = getLanguageIcon(tabSnip?.language);

  if (!tabSnip) return null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 min-w-30 max-w-50 cursor-pointer border-r border-[#252526] ${
        isActive
          ? "bg-[#1e1e1e] border-t-2 border-t-[#007acc] text-[#cccccc]"
          : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(tabSnip.id);
      }}
    >
      <Icon
        className="w-4 h-4 shrink-0"
        style={{ color: getLanguageColor(tabSnip.language) }}
      />
      <span className="flex-1 text-[13px] truncate">
        {tabSnip?.title || "Untitled"}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tabId);
        }}
        className="shrink-0 hover:bg-[#3e3e42] p-0.5 rounded-sm transition-colors"
      >
        <VscClose className="w-3 h-3" />
      </button>
    </div>
  );
};