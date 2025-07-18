import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Group, Attendee } from "@/types";

interface DistributionSummaryProps {
  groups: Group[];
  attendees: Attendee[];
  onExportGroups: () => void;
}

export function DistributionSummary({
  groups,
  attendees,
  onExportGroups,
}: DistributionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Distribution Summary</CardTitle>
          <Button onClick={onExportGroups} variant="default">
            Export Groups CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded">
            <h3 className="font-medium text-muted-foreground">Total Groups</h3>
            <p className="text-2xl font-bold text-slate-700">{groups.length}</p>
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
  );
}