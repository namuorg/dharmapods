"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

export function GroupCard({
  group,
  moveMemberBetweenGroups,
  onTeacherNameChange,
  existingTeacherNames = [],
}: GroupCardProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group {group.id}</CardTitle>
        <div className="mt-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-sm font-normal bg-white"
              >
                {group.teacherName || "Select teacher..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search teacher..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>
                    {searchValue ? (
                      <button
                        className="w-full p-2 text-left hover:bg-accent"
                        onClick={() => {
                          onTeacherNameChange(group.id, searchValue);
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        Add &quot;{searchValue}&quot; as new teacher
                      </button>
                    ) : (
                      "No teacher found."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {group.teacherName && (
                      <CommandItem
                        value="clear"
                        onSelect={() => {
                          onTeacherNameChange(group.id, "");
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        <span className="text-muted-foreground">
                          Clear selection
                        </span>
                      </CommandItem>
                    )}
                    {existingTeacherNames.map((name) => (
                      <CommandItem
                        key={name}
                        value={name}
                        onSelect={() => {
                          onTeacherNameChange(group.id, name);
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        {name}
                        <Check
                          className={cn(
                            "ml-auto",
                            group.teacherName === name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
              <span className="text-muted-foreground">
                Avg Retreat Experience:
              </span>{" "}
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
