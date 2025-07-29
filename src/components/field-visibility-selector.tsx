"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2Icon } from "lucide-react";

interface FieldVisibilitySelectorProps {
  visibleFields: Set<string>;
  onVisibleFieldsChange: (fields: Set<string>) => void;
}

const FIELD_OPTIONS = [
  { id: "age", label: "Age" },
  { id: "gender", label: "Gender" },
  { id: "experience", label: "Retreat Experience" },
  { id: "bipoc", label: "BIPOC" },
  { id: "lgbtqia", label: "LGBTQIA+" },
];

export function FieldVisibilitySelector({
  visibleFields,
  onVisibleFieldsChange,
}: FieldVisibilitySelectorProps) {
  const handleFieldToggle = (fieldId: string) => {
    const newFields = new Set(visibleFields);
    if (newFields.has(fieldId)) {
      newFields.delete(fieldId);
    } else {
      newFields.add(fieldId);
    }
    onVisibleFieldsChange(newFields);
  };

  const handleSelectAll = () => {
    onVisibleFieldsChange(new Set(FIELD_OPTIONS.map((field) => field.id)));
  };

  const handleSelectNone = () => {
    onVisibleFieldsChange(new Set());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white">
          <Settings2Icon className="h-4 w-4" />
          Fields
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-medium text-sm">Visible Fields</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleSelectAll}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleSelectNone}
              >
                None
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {FIELD_OPTIONS.map((field) => (
              <label
                key={field.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Checkbox
                  checked={visibleFields.has(field.id)}
                  onCheckedChange={() => handleFieldToggle(field.id)}
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
