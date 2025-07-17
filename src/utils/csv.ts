import Papa from "papaparse";
import { Attendee } from "@/types";

export function parseCSV(csvText: string): Attendee[] {
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

export function exportGroupsToCSV(groups: import("@/types").Group[]): void {
  if (groups.length === 0) return;

  const csvData = groups.flatMap((group) =>
    group.members.map((member) => ({
      groupId: group.id,
      teacherName: group.teacherName || "",
      name: member.name,
      age: member.age,
      gender: member.gender,
      isBIPOC: member.bipoc,
      isLGBTQIA: member.lgbtqia,
      experienceDays: member.experienceDays,
    }))
  );

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const timestamp = new Date().toISOString().split('T')[0];
  a.download = `dharmapods-groups-${timestamp}.csv`;
  
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}