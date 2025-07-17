"use client";

import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
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
import { 
  draggable, 
  dropTargetForElements 
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const DEFAULT_GROUP_SIZE = 8;

interface Attendee {
  id: string;
  name: string;
  age: number;
  gender: string;
  bipoc: boolean;
  lgbtqia: boolean;
  experienceDays: number;
}

interface Group {
  id: number;
  members: Attendee[];
  demographics: {
    avgAge: number;
    genderDistribution: Record<string, number>;
    bipocCount: number;
    lgbtqiaCount: number;
    avgExperience: number;
  };
}

function parseCSV(csvText: string): Attendee[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return result.data.map((row, index) => ({
    id: `attendee-${Date.now()}-${index}`,
    name: row.name?.trim() || "",
    age: parseInt(row.age) || 0,
    gender: row.gender?.trim() || "",
    bipoc:
      row.isBIPOC?.toLowerCase() === "true" ||
      row.isBIPOC?.toLowerCase() === "yes",
    lgbtqia:
      row.isLGBTQIA?.toLowerCase() === "true" ||
      row.isLGBTQIA?.toLowerCase() === "yes",
    experienceDays: parseInt(row.experienceDays) || 0,
  }));
}

function calculateGroupDemographics(members: Attendee[]) {
  const avgAge = members.reduce((sum, m) => sum + m.age, 0) / members.length;
  const genderDistribution = members.reduce((acc, m) => {
    acc[m.gender] = (acc[m.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bipocCount = members.filter((m) => m.bipoc).length;
  const lgbtqiaCount = members.filter((m) => m.lgbtqia).length;
  const avgExperience =
    members.reduce((sum, m) => sum + m.experienceDays, 0) / members.length;

  return {
    avgAge: Math.round(avgAge),
    genderDistribution,
    bipocCount,
    lgbtqiaCount,
    avgExperience: Math.round(avgExperience),
  };
}

function distributeIntoGroups(
  attendees: Attendee[],
  groupSize: number = DEFAULT_GROUP_SIZE
): Group[] {
  const numGroups = Math.ceil(attendees.length / groupSize);
  const groups: Attendee[][] = Array(numGroups)
    .fill(null)
    .map(() => []);

  // Step 1: Categorize attendees
  const bipocAndLgbtqia = attendees.filter((a) => a.bipoc && a.lgbtqia);
  const bipocOnly = attendees.filter((a) => a.bipoc && !a.lgbtqia);
  const lgbtqiaOnly = attendees.filter((a) => !a.bipoc && a.lgbtqia);
  const neither = attendees.filter((a) => !a.bipoc && !a.lgbtqia);

  // Helper function to shuffle an array
  const shuffle = (array: Attendee[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper function to find smallest group
  const findSmallestGroup = () => {
    let smallestIndex = 0;
    let smallestSize = groups[0].length;
    for (let i = 1; i < groups.length; i++) {
      if (groups[i].length < smallestSize) {
        smallestSize = groups[i].length;
        smallestIndex = i;
      }
    }
    return smallestIndex;
  };

  let currentGroupIndex = 0;

  // Step 2: Seed groups with BIPOC and LGBTQIA pairs
  const shuffledBipocAndLgbtqia = shuffle(bipocAndLgbtqia);
  for (let i = 0; i < shuffledBipocAndLgbtqia.length; i += 2) {
    if (i + 1 < shuffledBipocAndLgbtqia.length) {
      // Add pair to current group
      groups[currentGroupIndex].push(shuffledBipocAndLgbtqia[i]);
      groups[currentGroupIndex].push(shuffledBipocAndLgbtqia[i + 1]);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    }
  }

  // Step 3: Seed groups with BIPOC only pairs
  const shuffledBipocOnly = shuffle(bipocOnly);
  for (let i = 0; i < shuffledBipocOnly.length; i += 2) {
    if (i + 1 < shuffledBipocOnly.length) {
      groups[currentGroupIndex].push(shuffledBipocOnly[i]);
      groups[currentGroupIndex].push(shuffledBipocOnly[i + 1]);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    }
  }

  // Step 4: Seed groups with LGBTQIA only pairs
  const shuffledLgbtqiaOnly = shuffle(lgbtqiaOnly);
  for (let i = 0; i < shuffledLgbtqiaOnly.length; i += 2) {
    if (i + 1 < shuffledLgbtqiaOnly.length) {
      groups[currentGroupIndex].push(shuffledLgbtqiaOnly[i]);
      groups[currentGroupIndex].push(shuffledLgbtqiaOnly[i + 1]);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    }
  }

  // Step 5: Place leftover individuals
  const leftovers: Attendee[] = [];

  // Leftover from BIPOC and LGBTQIA
  if (shuffledBipocAndLgbtqia.length % 2 === 1) {
    const leftover =
      shuffledBipocAndLgbtqia[shuffledBipocAndLgbtqia.length - 1];
    // Find group with existing BIPOC and LGBTQIA members
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      const hasBipoc = groups[i].some((m) => m.bipoc);
      const hasLgbtqia = groups[i].some((m) => m.lgbtqia);
      if (hasBipoc && hasLgbtqia) {
        groups[i].push(leftover);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Leftover from BIPOC only
  if (shuffledBipocOnly.length % 2 === 1) {
    const leftover = shuffledBipocOnly[shuffledBipocOnly.length - 1];
    // Find group with existing BIPOC members
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      const hasBipoc = groups[i].some((m) => m.bipoc);
      if (hasBipoc) {
        groups[i].push(leftover);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Leftover from LGBTQIA only
  if (shuffledLgbtqiaOnly.length % 2 === 1) {
    const leftover = shuffledLgbtqiaOnly[shuffledLgbtqiaOnly.length - 1];
    // Find group with existing LGBTQIA members
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      const hasLgbtqia = groups[i].some((m) => m.lgbtqia);
      if (hasLgbtqia) {
        groups[i].push(leftover);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Step 6: Distribute remaining attendees (neither category + any unplaced leftovers)
  const remainingAttendees = [...neither, ...leftovers];
  const shuffledRemaining = shuffle(remainingAttendees);

  for (const attendee of shuffledRemaining) {
    const smallestGroupIndex = findSmallestGroup();
    groups[smallestGroupIndex].push(attendee);
  }

  // Convert to Group objects
  return groups.map((members, index) => ({
    id: index + 1,
    members,
    demographics: calculateGroupDemographics(members),
  }));
}

export default function Home() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP_SIZE);

  const moveMemberBetweenGroups = (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number
  ) => {
    if (sourceGroupId === targetGroupId) return;

    setGroups(prevGroups => {
      const newGroups = [...prevGroups];
      const sourceGroup = newGroups.find(g => g.id === sourceGroupId);
      const targetGroup = newGroups.find(g => g.id === targetGroupId);

      if (!sourceGroup || !targetGroup) return prevGroups;

      const memberIndex = sourceGroup.members.findIndex(m => m.id === memberId);
      if (memberIndex === -1) return prevGroups;

      const memberToMove = sourceGroup.members[memberIndex];
      sourceGroup.members.splice(memberIndex, 1);
      targetGroup.members.push(memberToMove);

      sourceGroup.demographics = calculateGroupDemographics(sourceGroup.members);
      targetGroup.demographics = calculateGroupDemographics(targetGroup.members);

      return newGroups;
    });
  };

  const DraggableMember = ({ 
    member, 
    memberIndex, 
    groupId 
  }: { 
    member: Attendee; 
    memberIndex: number; 
    groupId: number; 
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      return draggable({
        element,
        getInitialData: () => ({ memberId: member.id, groupId }),
      });
    }, [member.id, groupId]);

    return (
      <div
        ref={ref}
        className="text-sm text-muted-foreground cursor-move hover:bg-muted p-2 rounded transition-colors"
      >
        {member.name} ({member.age}, {member.gender})
        {member.bipoc && (
          <Badge variant="secondary" className="ml-2">
            BIPOC
          </Badge>
        )}
        {member.lgbtqia && (
          <Badge variant="outline" className="ml-2">
            LGBTQIA
          </Badge>
        )}
      </div>
    );
  };

  const GroupCard = ({ group }: { group: Group }) => {
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
          moveMemberBetweenGroups(data.memberId, data.groupId, group.id);
        },
      });
    }, [group.id]);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Group {group.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="font-medium text-foreground mb-2">
              Members ({group.members.length})
            </h4>
            <div 
              ref={ref}
              className={`space-y-1 min-h-[100px] border-2 border-dashed rounded p-2 transition-all duration-200 ${
                isDraggedOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {group.members.map((member, index) => (
                <DraggableMember
                  key={member.id}
                  member={member}
                  memberIndex={index}
                  groupId={group.id}
                />
              ))}
              {group.members.length === 0 && (
                <div className={`text-center py-4 transition-colors duration-200 ${
                  isDraggedOver ? 'text-blue-600 font-medium' : 'text-muted-foreground'
                }`}>
                  Drop members here
                </div>
              )}
            </div>
          </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-2">
                Demographics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Avg Age:
                  </span>{" "}
                  {group.demographics.avgAge}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Avg Experience:
                  </span>{" "}
                  {group.demographics.avgExperience} days
                </div>
                <div>
                  <span className="text-muted-foreground">BIPOC:</span>{" "}
                  {group.demographics.bipocCount}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    LGBTQIA:
                  </span>{" "}
                  {group.demographics.lgbtqiaCount}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">
                  Gender Distribution:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(
                    group.demographics.genderDistribution
                  ).map(([gender, count]) => (
                    <Badge
                      key={gender}
                      variant="outline"
                      className="text-xs"
                    >
                      {gender}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    );
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-foreground">DharmaPods</h1>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Attendees CSV</CardTitle>
              <CardDescription>
                CSV should have columns: name, age, gender, isBIPOC, isLGBTQIA,
                experienceDays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
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
                  className="w-full sm:w-auto"
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
              <Button
                onClick={handleDistributeGroups}
                className="w-full"
                disabled={attendees.length === 0}
              >
                Distribute into Groups
              </Button>
            </CardContent>
          </Card>
        </div>

        {groups.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
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
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Avg Age
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {Math.round(
                        attendees.reduce((sum, a) => sum + a.age, 0) /
                          attendees.length
                      )}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Avg Experience
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {Math.round(
                        attendees.reduce(
                          (sum, a) => sum + a.experienceDays,
                          0
                        ) / attendees.length
                      )}{" "}
                      days
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
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
