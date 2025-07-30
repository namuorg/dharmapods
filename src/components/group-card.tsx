"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DraggableMember } from "./draggable-member";
import { EmptyDropZone } from "./empty-drop-zone";
import { TeacherCombobox } from "./teacher-combobox";
import { Group } from "@/types";
import { getRetreatExpSuffix } from "@/utils/retreat-exp";
import { useAppStore } from "@/store/app-store";

interface NotesTextareaProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

function NotesTextarea({ value, onChange, placeholder }: NotesTextareaProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Update local value when prop value changes (e.g., from external sources)
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for debounced update
      const newTimeoutId = setTimeout(() => {
        onChange(newValue);
      }, 500); // 500ms debounce delay

      setTimeoutId(newTimeoutId);
    },
    [onChange, timeoutId],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <Textarea
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      className="min-h-[80px] resize-none"
    />
  );
}

interface GroupCardProps {
  group: Group;
  existingTeacherNames?: string[];
}

export const GroupCard = memo(function GroupCard({
  group,
  existingTeacherNames = [],
}: GroupCardProps) {
  const {
    avoidSoloAffinity,
    retreatExpUnit,
    visibleFields,
    moveMemberBetweenGroups,
    updateGroupTeacherName,
    updateGroupNotes,
  } = useAppStore();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group {group.id}</CardTitle>
        <div className="mt-2">
          <TeacherCombobox
            value={group.teacherName}
            onChange={(value) => updateGroupTeacherName(group.id, value)}
            existingTeacherNames={existingTeacherNames}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-medium text-foreground mb-2">
            Members ({group.members.length})
          </h4>
          <div className="border-2 border-dashed border-gray-200 rounded p-2">
            {group.members.map((member, index) => (
              <DraggableMember
                key={member.id}
                member={member}
                memberIndex={index}
                groupId={group.id}
                moveMemberBetweenGroups={moveMemberBetweenGroups}
                retreatExpUnit={retreatExpUnit}
                visibleFields={visibleFields}
              />
            ))}
            {group.members.length === 0 && (
              <EmptyDropZone
                groupId={group.id}
                moveMemberBetweenGroups={moveMemberBetweenGroups}
              />
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-foreground mb-2">Demographics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Avg Age:</span>{" "}
              {group.demographics.avgAge}
            </div>
            <div>
              <span className="text-muted-foreground">Avg Retreat Exp:</span>{" "}
              {group.demographics.avgExperience}
              {getRetreatExpSuffix(retreatExpUnit)}
            </div>
            <div>
              {avoidSoloAffinity && group.demographics.bipocCount === 1 ? (
                <Badge variant="destructive" className="text-xs">
                  BIPOC: {group.demographics.bipocCount}
                </Badge>
              ) : (
                <>
                  <span className="text-muted-foreground">BIPOC:</span>{" "}
                  {group.demographics.bipocCount}
                </>
              )}
            </div>
            <div>
              {avoidSoloAffinity && group.demographics.lgbtqiaCount === 1 ? (
                <Badge variant="destructive" className="text-xs">
                  LGBTQIA: {group.demographics.lgbtqiaCount}
                </Badge>
              ) : (
                <>
                  <span className="text-muted-foreground">LGBTQIA:</span>{" "}
                  {group.demographics.lgbtqiaCount}
                </>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className="text-muted-foreground text-sm">
              Gender Distribution:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(group.demographics.genderDistribution).map(
                ([gender, count]) => (
                  <Badge key={gender} variant="outline" className="text-xs">
                    {gender}: {count}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-foreground mb-2">Notes</h4>
          <NotesTextarea
            placeholder="Add notes about this group..."
            value={group.notes}
            onChange={(value) => updateGroupNotes(group.id, value)}
          />
        </div>
      </CardContent>
    </Card>
  );
});
