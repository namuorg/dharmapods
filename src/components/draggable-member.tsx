"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Attendee } from "@/types";

interface DraggableMemberProps {
  member: Attendee;
  memberIndex: number;
  groupId: number;
  moveMemberBetweenGroups: (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex?: number
  ) => void;
}

export function DraggableMember({
  member,
  memberIndex,
  groupId,
  moveMemberBetweenGroups,
}: DraggableMemberProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [closestEdge, setClosestEdge] = useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const cleanup: (() => void)[] = [];

    // Make element draggable
    cleanup.push(
      draggable({
        element,
        getInitialData: () => ({
          memberId: member.id,
          groupId,
          memberIndex,
        }),
      })
    );

    // Make element a drop target
    cleanup.push(
      dropTargetForElements({
        element,
        getData: () => ({
          memberId: member.id,
          groupId,
          memberIndex,
        }),
        canDrop: ({ source }) => {
          // Don't allow dropping on self
          const sourceData = source.data as { memberId: string };
          return sourceData.memberId !== member.id;
        },
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => {
          setIsDraggedOver(false);
          setClosestEdge(null);
        },
        onDrop: ({ source, self }) => {
          setIsDraggedOver(false);
          setClosestEdge(null);

          const sourceData = source.data as {
            memberId: string;
            groupId: number;
            memberIndex: number;
          };

          const edge = extractClosestEdge(self.data);
          let targetIndex = memberIndex;

          if (edge === "bottom") {
            targetIndex = memberIndex + 1;
          }

          moveMemberBetweenGroups(
            sourceData.memberId,
            sourceData.groupId,
            groupId,
            targetIndex
          );
        },
        getIsSticky: () => true,
        ...attachClosestEdge,
      })
    );

    return () => cleanup.forEach((fn) => fn());
  }, [member.id, groupId, memberIndex, moveMemberBetweenGroups]);

  useEffect(() => {
    if (!isDraggedOver) return;

    const element = ref.current;
    if (!element) return;

    const handleDragMove = (event: DragEvent) => {
      const rect = element.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const edge = event.clientY <= midpoint ? "top" : "bottom";
      setClosestEdge(edge);
    };

    document.addEventListener("dragover", handleDragMove);
    return () => document.removeEventListener("dragover", handleDragMove);
  }, [isDraggedOver]);

  return (
    <div className="relative">
      {isDraggedOver && closestEdge === "top" && (
        <div className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}
      <div
        ref={ref}
        className={`text-sm text-muted-foreground cursor-move p-2 rounded transition-colors ${
          member.gender.toLowerCase() === "female" || member.gender.toLowerCase() === "f"
            ? "bg-pink-50 hover:bg-pink-100"
            : member.gender.toLowerCase() === "male" || member.gender.toLowerCase() === "m"
            ? "bg-blue-50 hover:bg-blue-100"
            : member.gender.toLowerCase() === "non-binary" || member.gender.toLowerCase() === "nb"
            ? "bg-yellow-50 hover:bg-yellow-100"
            : "hover:bg-muted"
        }`}
      >
        {member.name} ({member.age}, {member.gender})
        {member.bipoc && (
          <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200">
            BIPOC
          </Badge>
        )}
        {member.lgbtqia && (
          <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">
            LGBTQIA
          </Badge>
        )}
      </div>
      {isDraggedOver && closestEdge === "bottom" && (
        <div className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}
    </div>
  );
}