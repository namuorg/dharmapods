"use client";

import { useState, useRef, useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

interface EmptyDropZoneProps {
  groupId: number;
  moveMemberBetweenGroups: (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number
  ) => void;
}

export function EmptyDropZone({
  groupId,
  moveMemberBetweenGroups,
}: EmptyDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false);
        const data = source.data as { memberId: string; groupId: number };
        moveMemberBetweenGroups(data.memberId, data.groupId, groupId);
      },
    });
  }, [groupId, moveMemberBetweenGroups]);

  return (
    <div
      ref={ref}
      className={`text-center text-sm py-4 transition-colors duration-200 ${
        isDraggedOver
          ? "text-blue-600 font-medium bg-blue-50"
          : "text-muted-foreground"
      }`}
    >
      Drop members here
    </div>
  );
}
