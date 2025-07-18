"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherComboboxProps {
  value: string | undefined;
  onChange: (value: string) => void;
  existingTeacherNames: string[];
}

export function TeacherCombobox({
  value,
  onChange,
  existingTeacherNames,
}: TeacherComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm font-normal bg-white"
        >
          {value || "Select teacher..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search teacher..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty
              className={`${
                searchValue ? "py-0" : "pt-2 text-muted-foreground"
              } text-center text-sm`}
            >
              {searchValue ? (
                <button
                  className="w-full p-2 text-left hover:bg-accent"
                  onClick={() => {
                    onChange(searchValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  Add &quot;{searchValue}&quot; as new teacher
                </button>
              ) : (
                "No teacher found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  value="clear"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <span className="text-muted-foreground">Clear selection</span>
                </CommandItem>
              )}
              {existingTeacherNames.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  {name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === name ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
