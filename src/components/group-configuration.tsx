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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

interface GroupConfigurationProps {
  groupSize: number;
  attendeesCount: number;
  onGroupSizeChange: (size: number) => void;
  onDistributeGroups: () => void;
  onImportGroups: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DEFAULT_NUMBER_OF_GROUPS = 12;

export function GroupConfiguration({
  groupSize,
  attendeesCount,
  onGroupSizeChange,
  onDistributeGroups,
  onImportGroups,
}: GroupConfigurationProps) {
  const [configMode, setConfigMode] = React.useState<"size" | "count">("count");
  const [numberOfGroups, setNumberOfGroups] = React.useState(
    DEFAULT_NUMBER_OF_GROUPS,
  );

  const handleModeChange = (mode: "size" | "count") => {
    setConfigMode(mode);
    if (mode === "count" && attendeesCount > 0) {
      const calculatedSize = Math.ceil(attendeesCount / numberOfGroups);
      onGroupSizeChange(calculatedSize);
    }
  };

  const handleNumberOfGroupsChange = (value: number) => {
    setNumberOfGroups(value);
    if (attendeesCount > 0) {
      const calculatedSize = Math.ceil(attendeesCount / value);
      onGroupSizeChange(calculatedSize);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Configuration</CardTitle>
        <CardDescription>
          Configure how attendees should be distributed into groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={configMode}
          onValueChange={handleModeChange}
          className="mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="count" id="count" />
            <Label htmlFor="count">Specify number of groups</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="size" id="size" />
            <Label htmlFor="size">Specify group size</Label>
          </div>
        </RadioGroup>

        {configMode === "size" ? (
          <div className="flex items-center gap-2 mb-4">
            <Label htmlFor="groupSize" className="text-sm font-medium">
              Group Size:
            </Label>
            <Input
              id="groupSize"
              type="number"
              value={groupSize}
              onChange={(e) => onGroupSizeChange(parseInt(e.target.value))}
              className="w-16"
            />
            {attendeesCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({Math.ceil(attendeesCount / groupSize)} groups)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <Label htmlFor="numberOfGroups" className="text-sm font-medium">
              Number of Groups:
            </Label>
            <Input
              id="numberOfGroups"
              type="number"
              value={numberOfGroups}
              onChange={(e) =>
                handleNumberOfGroupsChange(parseInt(e.target.value))
              }
              className="w-16"
            />
            {attendeesCount > 0 && (
              <span className="text-sm text-muted-foreground">
                (≈ {Math.ceil(attendeesCount / numberOfGroups)} per group)
              </span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button
            onClick={onDistributeGroups}
            className="w-full sm:flex-[2]"
            disabled={attendeesCount === 0}
          >
            Distribute into Groups
          </Button>
          <div className="relative w-full sm:flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={onImportGroups}
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
            <div>• Ensure no group has only 1 BIPOC or LGBTQIA member</div>
            <div>• Create balanced representation across all groups</div>
            <div>• Maintain similar group sizes</div>
            <div>• Support inclusive group dynamics</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
