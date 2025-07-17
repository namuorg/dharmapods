"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DraggableMember } from "./draggable-member";
import { EmptyDropZone } from "./empty-drop-zone";
import { Group } from "@/types";

interface GroupCardProps {
  group: Group;
  moveMemberBetweenGroups: (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex?: number
  ) => void;
  onTeacherNameChange: (groupId: number, teacherName: string) => void;
  existingTeacherNames?: string[];
}

export function GroupCard({ group, moveMemberBetweenGroups, onTeacherNameChange, existingTeacherNames = [] }: GroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group {group.id}</CardTitle>
        <div className="mt-2">
          <Input 
            placeholder="Teacher name"
            value={group.teacherName || ""}
            onChange={(e) => onTeacherNameChange(group.id, e.target.value)}
            className="text-sm"
            list={`teacher-list-${group.id}`}
          />
          <datalist id={`teacher-list-${group.id}`}>
            {existingTeacherNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-medium text-foreground mb-2">
            Members ({group.members.length})
          </h4>
          <div className="min-h-[100px] border-2 border-dashed border-gray-200 rounded p-2">
            {group.members.map((member, index) => (
              <DraggableMember
                key={member.id}
                member={member}
                memberIndex={index}
                groupId={group.id}
                moveMemberBetweenGroups={moveMemberBetweenGroups}
              />
            ))}
            {group.members.length === 0 && (
              <EmptyDropZone groupId={group.id} moveMemberBetweenGroups={moveMemberBetweenGroups} />
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
              <span className="text-muted-foreground">Avg Retreat Experience:</span>{" "}
              {group.demographics.avgExperience} days
            </div>
            <div>
              <span
                className={
                  group.demographics.bipocCount === 1
                    ? "text-red-500"
                    : "text-muted-foreground"
                }
              >
                BIPOC:
              </span>{" "}
              <span
                className={
                  group.demographics.bipocCount === 1 ? "text-red-500" : ""
                }
              >
                {group.demographics.bipocCount}
              </span>
            </div>
            <div>
              <span
                className={
                  group.demographics.lgbtqiaCount === 1
                    ? "text-red-500"
                    : "text-muted-foreground"
                }
              >
                LGBTQIA:
              </span>{" "}
              <span
                className={
                  group.demographics.lgbtqiaCount === 1 ? "text-red-500" : ""
                }
              >
                {group.demographics.lgbtqiaCount}
              </span>
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
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}