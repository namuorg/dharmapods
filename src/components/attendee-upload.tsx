import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttendeeUploadProps {
  attendeesCount: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSampleData: () => void;
  onDownloadTemplate: () => void;
}

export function AttendeeUpload({
  attendeesCount,
  onFileUpload,
  onLoadSampleData,
  onDownloadTemplate,
}: AttendeeUploadProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Attendees CSV</CardTitle>
        <CardDescription>
          CSV should have columns: name, age, gender, isBIPOC, isLGBTQIA,
          retreatExp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="relative w-full sm:w-auto">
            <input
              type="file"
              accept=".csv"
              onChange={onFileUpload}
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
            onClick={onLoadSampleData}
            variant="outline"
            className="w-full sm:w-auto bg-white"
          >
            Use Sample Data
          </Button>
          <Button
            onClick={onDownloadTemplate}
            variant="outline"
            className="w-full sm:w-auto bg-muted"
          >
            Download Template
          </Button>
        </div>
        <div>
          {attendeesCount > 0 && (
            <p className="text-green-600 font-medium">
              {attendeesCount} attendees loaded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
