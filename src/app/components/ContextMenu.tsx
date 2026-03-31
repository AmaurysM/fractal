"use client"

import { useEffect, useRef } from "react";

export const ContextMenu = ({
    x,
    y,
    onClose,
    items
}: {
    x: number;
    y: number;
    onClose: () => void;
    items: Array<{ label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }>;
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        console.log("")

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 min-w-50"
            style={{ left: x, top: y }}
        >
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left transition-colors ${item.danger
                        ? 'hover:bg-[#f48771]/20 text-[#f48771]'
                        : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                        }`}
                >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};