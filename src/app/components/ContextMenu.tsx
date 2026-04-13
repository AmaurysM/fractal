"use client"

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MenuItem = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
};

// ── Mobile bottom sheet ──────────────────────────────────────────────────────

const BottomSheet = ({
    items,
    onClose,
}: {
    items: MenuItem[];
    onClose: () => void;
}) => {
    const [visible, setVisible] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStartY = useRef<number | null>(null);
    const isDragging = useRef(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 250);
    };

    const DISMISS_THRESHOLD = 80;

    const onHandlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartY.current = e.clientY;
        isDragging.current = false;
    };

    const onHandlePointerMove = (e: React.PointerEvent) => {
        if (dragStartY.current === null) return;
        const delta = e.clientY - dragStartY.current;
        if (delta > 0) {
            if (delta > 3) isDragging.current = true;
            setDragOffset(delta);
        }
    };

    const onHandlePointerUp = () => {
        dragStartY.current = null;
        if (dragOffset >= DISMISS_THRESHOLD) {
            handleClose();
        } else {
            setDragOffset(0);
        }
        isDragging.current = false;
    };

    const dragProgress = Math.min(dragOffset / DISMISS_THRESHOLD, 1);
    const backdropOpacity = visible ? Math.max(0, 0.5 - dragProgress * 0.5) : 0;
    const sheetTransform = visible ? `translateY(${dragOffset}px)` : "translateY(100%)";
    const sheetTransition = isDragging.current ? "none" : "transform 250ms ease";

    return createPortal(
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50"
                style={{
                    opacity: backdropOpacity,
                    transition: isDragging.current ? "none" : "opacity 200ms ease",
                }}
                onPointerDown={handleClose}
            />
            <div
                className="fixed left-0 right-0 bottom-0 z-50 bg-[#252526] border-t border-[#454545] rounded-t-xl pb-safe"
                style={{
                    transform: sheetTransform,
                    transition: sheetTransition,
                }}
            >
                <div
                    className="flex justify-center pt-3 pb-2 touch-none select-none cursor-grab active:cursor-grabbing group/handle"
                    onPointerDown={onHandlePointerDown}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}
                    onPointerCancel={onHandlePointerUp}
                >
                    <div className="w-10 h-1 rounded-full bg-[#555555] group-hover/handle:bg-[#007acc] transition-colors duration-150" />
                </div>

                <div className="pb-4">
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => {
                                item.onClick();
                                handleClose();
                            }}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 text-sm text-left transition-colors active:bg-[#2a2d2e] ${
                                item.danger ? "text-[#f48771]" : "text-[#cccccc]"
                            }`}
                        >
                            <span className="text-lg shrink-0">{item.icon}</span>
                            <span className="text-[15px]">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>,
        document.body
    );
};

// ── Desktop positioned menu ──────────────────────────────────────────────────

const PositionedMenu = ({
    x,
    y,
    items,
    onClose,
}: {
    x: number;
    y: number;
    items: MenuItem[];
    onClose: () => void;
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ left: x, top: y });

    useEffect(() => {
        if (!menuRef.current) return;
        const { width, height } = menuRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        setPos({
            left: x + width  > vw ? Math.max(0, vw - width  - 8) : x,
            top:  y + height > vh ? Math.max(0, vh - height - 8) : y,
        });
    }, [x, y]);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    return createPortal(
        <div
            ref={menuRef}
            className="fixed bg-[#252526] border border-[#454545] rounded-sm shadow-2xl py-1 z-50 min-w-50"
            style={{ left: pos.left, top: pos.top }}
        >
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => { item.onClick(); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left transition-colors ${
                        item.danger
                            ? "hover:bg-[#f48771]/20 text-[#f48771]"
                            : "hover:bg-[#2a2d2e] text-[#cccccc]"
                    }`}
                >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>,
        document.body
    );
};

// ── Public component ─────────────────────────────────────────────────────────

export const ContextMenu = ({
    x,
    y,
    onClose,
    items,
}: {
    x: number;
    y: number;
    onClose: () => void;
    items: MenuItem[];
}) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    if (isMobile) {
        return <BottomSheet items={items} onClose={onClose} />;
    }

    return <PositionedMenu x={x} y={y} items={items} onClose={onClose} />;
};