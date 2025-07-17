"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ReactECharts from "echarts-for-react";

import { Attendee, Group, DEFAULT_GROUP_SIZE } from "@/types";
import { parseCSV, exportGroupsToCSV, parseGroupsCSV } from "@/utils/csv";
import {
  distributeIntoGroups,
  calculateGroupDemographics,
} from "@/utils/group-distribution";
import { getAgeDistributionChartOptions } from "@/utils/charts/age-chart";
import { getExperienceDistributionChartOptions } from "@/utils/charts/experience-chart";
import { GroupCard } from "@/components/group-card";

export default function Home() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP_SIZE);
  const [showAgeChart, setShowAgeChart] = useState(false);
  const [showExperienceChart, setShowExperienceChart] = useState(false);

  const handleTeacherNameChange = (groupId: number, teacherName: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, teacherName } : group
      )
    );
  };

  const handleNotesChange = (groupId: number, notes: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, notes } : group
      )
    );
  };

  const moveMemberBetweenGroups = (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex?: number
  ) => {
    setGroups((prevGroups) => {
      const newGroups = [...prevGroups];
      const sourceGroup = newGroups.find((g) => g.id === sourceGroupId);
      const targetGroup = newGroups.find((g) => g.id === targetGroupId);

      if (!sourceGroup || !targetGroup) return prevGroups;

      const memberIndex = sourceGroup.members.findIndex(
        (m) => m.id === memberId
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
        sourceGroup.members
      );
      targetGroup.demographics = calculateGroupDemographics(
        targetGroup.members
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
      const distributedGroups = distributeIntoGroups(attendees, groupSize);
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
          <Card>
            <CardHeader>
              <CardTitle>Upload Attendees CSV</CardTitle>
              <CardDescription>
                CSV should have columns: name, age, gender, isBIPOC, isLGBTQIA,
                retreatExpDays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="csv-upload"
                  />
                  <Button asChild className="w-full sm:w-auto">
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      Upload CSV
                    </label>
                  </Button>
                </div>
                <Button
                  onClick={handleLoadSampleData}
                  variant="outline"
                  className="w-full sm:w-auto bg-white"
                >
                  Use Sample Data
                </Button>
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="w-full sm:w-auto bg-muted"
                >
                  Download Template
                </Button>
              </div>
              <div>
                {attendees.length > 0 && (
                  <p className="text-green-600 font-medium">
                    {attendees.length} attendees loaded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group Configuration</CardTitle>
              <CardDescription>
                Configure how attendees should be distributed into groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Label htmlFor="groupSize" className="text-sm font-medium">
                  Group Size:
                </Label>
                <Input
                  id="groupSize"
                  type="number"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value))}
                  className="w-16"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Button
                  onClick={handleDistributeGroups}
                  className="w-full sm:flex-[2]"
                  disabled={attendees.length === 0}
                >
                  Distribute into Groups
                </Button>
                <div className="relative w-full sm:flex-1">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportGroups}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="groups-import"
                  />
                  <Button asChild variant="outline" className="bg-white w-full">
                    <label htmlFor="groups-import" className="cursor-pointer">
                      Import Groups
                    </label>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-foreground mb-2">
                  Distribution Goals
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    • Ensure no group has only 1 BIPOC or LGBTQIA member
                  </div>
                  <div>• Create balanced representation across all groups</div>
                  <div>• Maintain similar group sizes</div>
                  <div>• Support inclusive group dynamics</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {groups.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Distribution Summary</CardTitle>
                  <Button onClick={handleExportGroups} variant="default">
                    Export Groups CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Total Groups
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {groups.length}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Total Attendees
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {attendees.length}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Avg Group Size
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {Math.round(attendees.length / groups.length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    className="bg-muted p-4 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => {
                      setShowAgeChart(!showAgeChart);
                      setShowExperienceChart(false);
                    }}
                  >
                    <h3 className="font-medium text-muted-foreground">
                      Avg Age
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {Math.round(
                        attendees.reduce((sum, a) => sum + a.age, 0) /
                          attendees.length
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view distribution
                    </p>
                  </div>
                  <div
                    className="bg-muted p-4 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => {
                      setShowExperienceChart(!showExperienceChart);
                      setShowAgeChart(false);
                    }}
                  >
                    <h3 className="font-medium text-muted-foreground">
                      Avg Retreat Experience
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {Math.round(
                        attendees.reduce(
                          (sum, a) => sum + a.retreatExpDays,
                          0
                        ) / attendees.length
                      )}{" "}
                      days
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view distribution
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">BIPOC</h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {attendees.filter((a) => a.bipoc).length} (
                      {Math.round(
                        (attendees.filter((a) => a.bipoc).length /
                          attendees.length) *
                          100
                      )}
                      %)
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      LGBTQIA
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {attendees.filter((a) => a.lgbtqia).length} (
                      {Math.round(
                        (attendees.filter((a) => a.lgbtqia).length /
                          attendees.length) *
                          100
                      )}
                      %)
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Gender Distribution
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      attendees.reduce((acc, a) => {
                        acc[a.gender] = (acc[a.gender] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([gender, count]) => (
                      <Badge key={gender} variant="outline" className="text-sm">
                        {gender}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
                {showAgeChart && (
                  <div className="mt-6 border-t pt-6">
                    <ReactECharts
                      option={getAgeDistributionChartOptions(attendees)}
                      style={{ height: "300px" }}
                    />
                  </div>
                )}
                {showExperienceChart && (
                  <div className="mt-6 border-t pt-6">
                    <ReactECharts
                      option={getExperienceDistributionChartOptions(attendees)}
                      style={{ height: "300px" }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map((group) => {
                const existingTeacherNames = groups
                  .filter((g) => g.id !== group.id && g.teacherName)
                  .map((g) => g.teacherName!)
                  .filter((name, index, self) => self.indexOf(name) === index);

                return (
                  <GroupCard
                    key={group.id}
                    group={group}
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
