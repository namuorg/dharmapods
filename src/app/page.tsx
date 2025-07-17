"use client";

import { useState } from "react";
import Papa from "papaparse";
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

const DEFAULT_GROUP_SIZE = 8;


interface Attendee {
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

  return result.data.map((row) => ({
    name: row.name?.trim() || "",
    age: parseInt(row.age) || 0,
    gender: row.gender?.trim() || "",
    bipoc:
      row.bipoc?.toLowerCase() === "true" || row.bipoc?.toLowerCase() === "yes",
    lgbtqia:
      row.lgbtqia?.toLowerCase() === "true" ||
      row.lgbtqia?.toLowerCase() === "yes",
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
  const groups: Group[] = [];
  const remaining = [...attendees];

  while (remaining.length > 0) {
    const group: Attendee[] = [];
    const currentGroupSize = Math.min(groupSize, remaining.length);

    for (let i = 0; i < currentGroupSize; i++) {
      if (remaining.length === 0) break;

      let selectedIndex = 0;

      if (group.length > 0) {
        const bipocInGroup = group.filter((m) => m.bipoc).length;
        const lgbtqiaInGroup = group.filter((m) => m.lgbtqia).length;

        const bipocCandidates = remaining.filter((m) => m.bipoc);
        const lgbtqiaCandidates = remaining.filter((m) => m.lgbtqia);

        if (bipocInGroup === 1 && bipocCandidates.length > 0) {
          selectedIndex = remaining.findIndex((m) => m.bipoc);
        } else if (lgbtqiaInGroup === 1 && lgbtqiaCandidates.length > 0) {
          selectedIndex = remaining.findIndex((m) => m.lgbtqia);
        } else {
          selectedIndex = Math.floor(Math.random() * remaining.length);
        }
      } else {
        selectedIndex = Math.floor(Math.random() * remaining.length);
      }

      group.push(remaining.splice(selectedIndex, 1)[0]);
    }

    groups.push({
      id: groups.length + 1,
      members: group,
      demographics: calculateGroupDemographics(group),
    });
  }

  return groups;
}

export default function Home() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP_SIZE);

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
      const response = await fetch('/sample-attendees.csv');
      const csvText = await response.text();
      const parsedAttendees = parseCSV(csvText);
      setAttendees(parsedAttendees);
      setGroups([]);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Retreat Group Distribution
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Attendees CSV</CardTitle>
            <CardDescription>
              CSV should have columns: name, age, gender, bipoc, lgbtqia,
              experienceDays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                {attendees.length > 0 && (
                  <p className="text-green-600 font-medium">
                    {attendees.length} attendees loaded
                  </p>
                )}
              </div>
              <Button 
                onClick={handleLoadSampleData}
                variant="outline"
                size="sm"
              >
                Use Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
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
                    <p className="text-2xl font-bold text-blue-600">
                      {groups.length}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Total Attendees
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {attendees.length}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Avg Group Size
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
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
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(attendees.reduce((sum, a) => sum + a.age, 0) / attendees.length)}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      Avg Experience
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(attendees.reduce((sum, a) => sum + a.experienceDays, 0) / attendees.length)} days
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      BIPOC
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {attendees.filter(a => a.bipoc).length} ({Math.round((attendees.filter(a => a.bipoc).length / attendees.length) * 100)}%)
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-medium text-muted-foreground">
                      LGBTQIA
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {attendees.filter(a => a.lgbtqia).length} ({Math.round((attendees.filter(a => a.lgbtqia).length / attendees.length) * 100)}%)
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
                      <Badge
                        key={gender}
                        variant="outline"
                        className="text-sm"
                      >
                        {gender}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>Group {group.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-foreground mb-2">
                        Members ({group.members.length})
                      </h4>
                      <div className="space-y-1">
                        {group.members.map((member, index) => (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground"
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
                        ))}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
