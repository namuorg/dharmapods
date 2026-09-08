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
  const { attendees, setAttendees, setGroups } = useAppStore();
  const attendeesCount = attendees.length;

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
    <Card>
      <CardHeader>
        <CardTitle>Upload Attendees CSV</CardTitle>
        <CardDescription>Required CSV columns:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              First Name
            </code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              Last Name
            </code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">Age</code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              Gender
            </code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">BIPOC</code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              LGBTQIA
            </code>
            <code className="px-2 py-1 bg-muted rounded-sm text-xs">
              Retreat Experience
            </code>
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
          <p className="text-green-600 font-medium">
            {attendeesCount} attendees loaded
          </p>
        )}
      </CardContent>
    </Card>
  );
}
