"use client";

import Image from "next/image";
import { useAppStore } from "@/store/app-store";

import { sortMembers, SortOption } from "@/utils/sort";
import { GroupCard } from "@/components/group-card";
import { AttendeeUpload } from "@/components/attendee-upload";
import { GroupConfiguration } from "@/components/group-configuration";
import { DistributionSummary } from "@/components/distribution-summary";
import { OverallDemographics } from "@/components/overall-demographics";
import { FieldVisibilitySelector } from "@/components/field-visibility-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SortSelector() {
  const { sortBy, setSortBy } = useAppStore();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-muted-foreground">
        Sort by:
      </label>
      <Select
        value={sortBy}
        onValueChange={(value) => setSortBy(value as SortOption)}
      >
        <SelectTrigger id="sort-select" className="w-[180px] bg-white">
          <SelectValue placeholder="Select sort option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="gender">Gender</SelectItem>
          <SelectItem value="experience">Retreat Experience</SelectItem>
          <SelectItem value="age">Age</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function TeacherFilter({ teacherNames }: { teacherNames: string[] }) {
  const { filterByTeacher, setFilterByTeacher } = useAppStore();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="filter-select" className="text-sm text-muted-foreground">
        Filter:
      </label>
      <Select value={filterByTeacher} onValueChange={setFilterByTeacher}>
        <SelectTrigger id="filter-select" className="w-[180px] bg-white">
          <SelectValue placeholder="Select teacher" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All teachers</SelectItem>
          {teacherNames.sort().map((teacherName) => (
            <SelectItem key={teacherName} value={teacherName}>
              {teacherName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function GroupsHeader() {
  const { groups } = useAppStore();
  const teacherNames = Array.from(
    new Set(groups.filter((g) => g.teacherName).map((g) => g.teacherName!)),
  );
  const showTeacherFilter = groups.some((g) => g.teacherName);
  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Groups</h2>
        <div className="flex flex-wrap items-center gap-4">
          <SortSelector />
          <FieldVisibilitySelector />
          {showTeacherFilter && <TeacherFilter teacherNames={teacherNames} />}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { groups, sortBy, filterByTeacher } = useAppStore();

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
          <AttendeeUpload />
          <GroupConfiguration />
        </div>

        {groups.length > 0 && (
          <div className="space-y-6">
            <DistributionSummary />
            <OverallDemographics />
            <GroupsHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups
                .filter((group) => {
                  if (filterByTeacher === "all") return true;
                  return group.teacherName === filterByTeacher;
                })
                .map((group) => {
                  const existingTeacherNames = groups
                    .filter((g) => g.id !== group.id && g.teacherName)
                    .map((g) => g.teacherName!)
                    .filter(
                      (name, index, self) => self.indexOf(name) === index,
                    );

                  const sortedGroup = {
                    ...group,
                    members: sortMembers(group.members, sortBy),
                  };

                  return (
                    <GroupCard
                      key={group.id}
                      group={sortedGroup}
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
