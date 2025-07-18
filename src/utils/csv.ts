import Papa from "papaparse";
import { Attendee, Group } from "@/types";

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
    retreatExpDays: parseInt(row.retreatExpDays) || 0,
  }));
}

export function parseGroupsCSV(csvText: string): Group[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const groupsMap = new Map<number, Group>();

  result.data.forEach((row) => {
    const groupId = parseInt(row.groupId) || 0;
    const member: Attendee = {
      id: `attendee-${Date.now()}-${Math.random()}`,
      name: row.name?.trim() || "",
      age: parseInt(row.age) || 0,
      gender: row.gender?.trim() || "",
      bipoc:
        row.isBIPOC?.toLowerCase() === "true" ||
        row.isBIPOC?.toLowerCase() === "yes",
      lgbtqia:
        row.isLGBTQIA?.toLowerCase() === "true" ||
        row.isLGBTQIA?.toLowerCase() === "yes",
      retreatExpDays: parseInt(row.retreatExpDays) || 0,
    };

    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        id: groupId,
        members: [],
        teacherName: row.teacherName?.trim() || "",
        notes: row.groupNotes?.trim() || "",
        demographics: {
          avgAge: 0,
          avgExperience: 0,
          bipocCount: 0,
          lgbtqiaCount: 0,
          genderDistribution: {},
        },
      });
    }

    groupsMap.get(groupId)!.members.push(member);
  });

  // Calculate demographics for each group
  const groups = Array.from(groupsMap.values());
  groups.forEach((group) => {
    const members = group.members;
    group.demographics = {
      avgAge: Math.round(
        members.reduce((sum, m) => sum + m.age, 0) / members.length,
      ),
      avgExperience: Math.round(
        members.reduce((sum, m) => sum + m.retreatExpDays, 0) / members.length,
      ),
      bipocCount: members.filter((m) => m.bipoc).length,
      lgbtqiaCount: members.filter((m) => m.lgbtqia).length,
      genderDistribution: members.reduce(
        (acc, m) => {
          acc[m.gender] = (acc[m.gender] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  });

  return groups;
}

export function exportGroupsToCSV(groups: Group[]): void {
  if (groups.length === 0) return;

  const csvData = groups.flatMap((group) =>
    group.members.map((member) => ({
      groupId: group.id,
      teacherName: group.teacherName || "",
      groupNotes: group.notes || "",
      name: member.name,
      age: member.age,
      gender: member.gender,
      isBIPOC: member.bipoc,
      isLGBTQIA: member.lgbtqia,
      retreatExpDays: member.retreatExpDays,
    })),
  );

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Format timestamp as YYYY-MM-DD-HHMMSS for unique filenames (local time)
  const now = new Date();
  const timestamp =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  a.download = `dharmapods-groups-${timestamp}.csv`;

  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
