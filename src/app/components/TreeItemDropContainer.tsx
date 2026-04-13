"use client"

import { useDraggable, useDroppable } from "@dnd-kit/react";
import { closestCorners } from "@dnd-kit/collision";
import { ExplorerItemType } from "../../../types/types";
import { LibraryDTO } from "../api/libraries/parents/route";
import { SnippetDTO } from "../api/snippets/parents/route";
import { PointerSensor, PointerActivationConstraints } from "@dnd-kit/dom";

export const TreeItemDropContainer = ({
    dto,
    type,
    parentId,
    children,
}: {
    dto: LibraryDTO | SnippetDTO;
    type: ExplorerItemType;
    parentId?: string;
    children: React.ReactNode;
}) => {
    const isFolder = type === ExplorerItemType.Folder;

    const { ref: draggableRef } = useDraggable({
        id: dto.id,
        data: { id: dto.id, type, title: dto.title, parentId: parentId ?? null },
        sensors: [
            PointerSensor.configure({
                activationConstraints: () => [
                    new PointerActivationConstraints.Distance({ value: 8 }),
                ],
            }),
        ],
    });

    const { ref: droppableRef, isDropTarget } = useDroppable({
        id: `drop-${dto.id}`,
        disabled: !isFolder,
        collisionDetector: closestCorners,
        data: { id: dto.id, type, title: dto.title, parentId: parentId ?? null },
    });

    const ref = (el: HTMLDivElement | null) => {
        draggableRef(el);
        droppableRef(el);
    };

    return (
        <div
            ref={ref}
            style={{
                outline: isDropTarget && isFolder ? "1px solid #007fd4" : undefined,
            }}
        >
            {children}
        </div>
    );
};