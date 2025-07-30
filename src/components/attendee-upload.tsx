"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { parseCSV } from "@/utils/csv";

export function AttendeeUpload() {
  const {
    attendees,
    retreatExpUnit,
    setAttendees,
    setRetreatExpUnit,
    setGroups,
  } = useAppStore();
  const attendeesCount = attendees.length;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const { attendees: parsedAttendees, retreatExpUnit } =
          parseCSV(csvText);
        setAttendees(parsedAttendees);
        setRetreatExpUnit(retreatExpUnit);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSampleData = async () => {
    try {
      const response = await fetch("/sample-attendees.csv");
      const csvText = await response.text();
      const { attendees: parsedAttendees, retreatExpUnit } = parseCSV(csvText);
      setAttendees(parsedAttendees);
      setRetreatExpUnit(retreatExpUnit);
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
    <Card>
      <CardHeader>
        <CardTitle>Upload Attendees CSV</CardTitle>
        <CardDescription>Required CSV columns:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">name</code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">age</code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              gender
            </code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              isBIPOC
            </code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              isLGBTQIA
            </code>
          </div>
          <div className="text-sm text-muted-foreground">
            Plus one of these for retreat experience:
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-muted rounded-sm text-xs">
                retreatExpCount
              </code>
              <span className="text-xs text-muted-foreground">
                for number of retreats
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              or
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-muted rounded-sm text-xs">
                retreatExpDays
              </code>
              <span className="text-xs text-muted-foreground">for days</span>
            </div>
          </div>
        </div>
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

        {attendeesCount > 0 && (
          <div className="space-y-1">
            <p className="text-green-600 font-medium">
              {attendeesCount} attendees loaded
            </p>
            <p className="text-sm text-muted-foreground">
              Experience unit:{" "}
              {retreatExpUnit === "retreats" ? "Number of retreats" : "Days"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
