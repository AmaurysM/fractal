export const TreeItemSkeleton = () => {
  return (
    <div className="px-2 py-1.5 flex items-center gap-2 animate-pulse">
      {/* Icon skeleton */}
      <div className="w-4 h-4 bg-[#3e3e42] rounded"></div>
      
      {/* Title skeleton */}
      <div className="flex-1 h-3 bg-[#3e3e42] rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
    </div>
  );
};

export const TreeSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <TreeItemSkeleton key={i} />
      ))}
    </div>
  );
};

export const StatsFooterSkeleton = () => {
  return (
    <div className="border-t border-[#3e3e42] bg-[#2d2d30]">
      <div className="grid grid-cols-2 divide-x divide-[#3e3e42]">
        <div className="px-3 py-2">
          <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-0.5">Libraries</div>
          <div className="h-[13px] w-8 bg-[#3e3e42] rounded animate-pulse"></div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[10px] text-[#858585] uppercase tracking-wider mb-0.5">Snippets</div>
          <div className="h-[13px] w-8 bg-[#3e3e42] rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};