"use client";

import { useState } from "react";
import Image from "next/image";

import { Attendee, Group, DEFAULT_NUMBER_OF_GROUPS } from "@/types";
import { parseCSV, exportGroupsToCSV, parseGroupsCSV } from "@/utils/csv";
import {
  distributeIntoGroups,
  calculateGroupDemographics,
} from "@/utils/group-distribution";
import { sortMembers, SortOption } from "@/utils/sort";
import { GroupCard } from "@/components/group-card";
import { AttendeeUpload } from "@/components/attendee-upload";
import { GroupConfiguration } from "@/components/group-configuration";
import { DistributionSummary } from "@/components/distribution-summary";
import { OverallDemographics } from "@/components/overall-demographics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [numGroups, setNumGroups] = useState(DEFAULT_NUMBER_OF_GROUPS);
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const handleTeacherNameChange = (groupId: number, teacherName: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, teacherName } : group,
      ),
    );
  };

  const handleNotesChange = (groupId: number, notes: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, notes } : group,
      ),
    );
  };

  const moveMemberBetweenGroups = (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex?: number,
  ) => {
    setGroups((prevGroups) => {
      const newGroups = [...prevGroups];
      const sourceGroup = newGroups.find((g) => g.id === sourceGroupId);
      const targetGroup = newGroups.find((g) => g.id === targetGroupId);

      if (!sourceGroup || !targetGroup) return prevGroups;

      const memberIndex = sourceGroup.members.findIndex(
        (m) => m.id === memberId,
      );
      if (memberIndex === -1) return prevGroups;

      const memberToMove = sourceGroup.members[memberIndex];

      // Remove from source
      sourceGroup.members.splice(memberIndex, 1);

      // Add to target at specific position
      if (targetIndex !== undefined) {
        // If moving within the same group, adjust index if needed
        const adjustedIndex =
          sourceGroupId === targetGroupId && targetIndex > memberIndex
            ? targetIndex - 1
            : targetIndex;
        targetGroup.members.splice(adjustedIndex, 0, memberToMove);
      } else {
        // Default behavior: add to end
        targetGroup.members.push(memberToMove);
      }

      sourceGroup.demographics = calculateGroupDemographics(
        sourceGroup.members,
      );
      targetGroup.demographics = calculateGroupDemographics(
        targetGroup.members,
      );

      return newGroups;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const parsedAttendees = parseCSV(csvText);
        setAttendees(parsedAttendees);
      };
      reader.readAsText(file);
    }
  };

  const handleDistributeGroups = () => {
    if (attendees.length > 0) {
      const distributedGroups = distributeIntoGroups(attendees, numGroups);
      setGroups(distributedGroups);
    }
  };

  const handleLoadSampleData = async () => {
    try {
      const response = await fetch("/sample-attendees.csv");
      const csvText = await response.text();
      const parsedAttendees = parseCSV(csvText);
      setAttendees(parsedAttendees);
      setGroups([]);
    } catch (error) {
      console.error("Error loading sample data:", error);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/sample-attendees.csv");
      const csvText = await response.text();
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendees-template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  const handleExportGroups = () => {
    exportGroupsToCSV(groups);
  };

  const handleImportGroups = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const importedGroups = parseGroupsCSV(csvText);
        setGroups(importedGroups);
        // Also set attendees based on imported groups
        const allAttendees = importedGroups.flatMap((group) => group.members);
        setAttendees(allAttendees);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex gap-4 mb-8 ${
            groups.length > 0 ? "items-center" : "flex-col items-center"
          }`}
        >
          <Image
            src="/logo.png"
            alt="DharmaPods Logo"
            width={groups.length > 0 ? 60 : 200}
            height={groups.length > 0 ? 60 : 200}
            className="rounded-lg"
          />
          {groups.length > 0 && (
            <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-nunito)]">
              DharmaPods
            </h1>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AttendeeUpload
            attendeesCount={attendees.length}
            onFileUpload={handleFileUpload}
            onLoadSampleData={handleLoadSampleData}
            onDownloadTemplate={handleDownloadTemplate}
          />

          <GroupConfiguration
            numGroups={numGroups}
            attendeesCount={attendees.length}
            onNumGroupsChange={setNumGroups}
            onDistributeGroups={handleDistributeGroups}
            onImportGroups={handleImportGroups}
          />
        </div>

        {groups.length > 0 && (
          <div className="space-y-6">
            <DistributionSummary
              groups={groups}
              attendees={attendees}
              onExportGroups={handleExportGroups}
            />

            <OverallDemographics attendees={attendees} />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Groups</h2>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-sm text-muted-foreground"
                >
                  Sort by:
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger
                    id="sort-select"
                    className="w-[180px] bg-white"
                  >
                    <SelectValue placeholder="Select sort option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="gender">Gender</SelectItem>
                    <SelectItem value="experience">
                      Retreat Experience
                    </SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map((group) => {
                const existingTeacherNames = groups
                  .filter((g) => g.id !== group.id && g.teacherName)
                  .map((g) => g.teacherName!)
                  .filter((name, index, self) => self.indexOf(name) === index);

                const sortedGroup = {
                  ...group,
                  members: sortMembers(group.members, sortBy),
                };

                return (
                  <GroupCard
                    key={group.id}
                    group={sortedGroup}
                    moveMemberBetweenGroups={moveMemberBetweenGroups}
                    onTeacherNameChange={handleTeacherNameChange}
                    onNotesChange={handleNotesChange}
                    existingTeacherNames={existingTeacherNames}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
