"use client";

import { useState, useRef, useEffect } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Attendee } from "@/types";
import { cn } from "@/lib/utils";

interface DraggableMemberProps {
  member: Attendee;
  memberIndex: number;
  groupId: number;
  moveMemberBetweenGroups: (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex?: number,
  ) => void;
  gradientType?: "age" | "experience";
}

export function DraggableMember({
  member,
  memberIndex,
  groupId,
  moveMemberBetweenGroups,
  gradientType = "age",
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
      }),
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
            targetIndex,
          );
        },
        getIsSticky: () => true,
        ...attachClosestEdge,
      }),
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
        className={cn(
          "text-sm cursor-move p-2 rounded rounded-r-none flex items-center justify-between",
          getGenderBackgroundColor(member.gender),
          gradientType === "age"
            ? getAgeBorderColor(member.age)
            : getExperienceBorderColor(member.retreatExpDays),
        )}
      >
        <span>{member.name}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {member.bipoc && <span title="BIPOC">🌍</span>}
            {member.lgbtqia && <span title="LGBTQIA">🏳️‍🌈</span>}
          </div>
          <div className="flex items-center text-muted-foreground text-xs gap-2">
            <span className="w-8 text-right">
              {getGenderDisplay(member.gender)}
            </span>
            {gradientType === "age" ? (
              <>
                <span className="w-6 text-right">{member.retreatExpDays}d</span>
                <span className="w-6 text-right">{member.age}</span>
              </>
            ) : (
              <>
                <span className="w-6 text-right">{member.age}</span>
                <span className="w-6 text-right">{member.retreatExpDays}d</span>
              </>
            )}
          </div>
        </div>
      </div>
      {isDraggedOver && closestEdge === "bottom" && (
        <div className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}
    </div>
  );
}

const AGE_RANGE_MIN = 20;
const AGE_RANGE_MAX = 80;

function getAgeBorderColor(age: number): string {
  const percent = Math.min(
    1,
    Math.max(0, (age - AGE_RANGE_MIN) / (AGE_RANGE_MAX - AGE_RANGE_MIN)),
  );
  const steps = [
    "border-gray-200",
    "border-gray-300",
    "border-gray-400",
    "border-gray-500",
    "border-gray-600",
    "border-gray-700",
    "border-gray-800",
    "border-gray-900",
  ];
  const stepIndex = Math.floor(percent * (steps.length - 1));
  return `border-r-4 ${steps[stepIndex]}`;
}

function getGenderDisplay(gender: string): string {
  if (gender.toLowerCase() === "male" || gender.toLowerCase() === "m") {
    return "M";
  } else if (
    gender.toLowerCase() === "female" ||
    gender.toLowerCase() === "f"
  ) {
    return "F";
  } else if (
    gender.toLowerCase() === "non-binary" ||
    gender.toLowerCase() === "nonbinary" ||
    gender.toLowerCase() === "nb"
  ) {
    return "NB";
  } else {
    return gender;
  }
}

const EXPERIENCE_RANGE_MIN = 0;
const EXPERIENCE_RANGE_MAX = 30;

function getExperienceBorderColor(retreatExpDays: number): string {
  const percent = Math.min(
    1,
    Math.max(
      0,
      (retreatExpDays - EXPERIENCE_RANGE_MIN) /
        (EXPERIENCE_RANGE_MAX - EXPERIENCE_RANGE_MIN),
    ),
  );
  const steps = [
    "border-green-200",
    "border-green-300",
    "border-green-400",
    "border-green-500",
    "border-green-600",
    "border-green-700",
    "border-green-800",
    "border-green-900",
  ];
  const stepIndex = Math.floor(percent * (steps.length - 1));
  return `border-r-4 ${steps[stepIndex]}`;
}

function getGenderBackgroundColor(gender: string): string {
  if (gender.toLowerCase() === "male" || gender.toLowerCase() === "m") {
    return "bg-blue-50 hover:bg-blue-100";
  } else if (
    gender.toLowerCase() === "female" ||
    gender.toLowerCase() === "f"
  ) {
    return "bg-pink-50 hover:bg-pink-100";
  } else if (!gender || gender.trim() === "") {
    return "bg-gray-50 hover:bg-gray-100";
  } else {
    return "bg-yellow-50 hover:bg-yellow-100";
  }
}
