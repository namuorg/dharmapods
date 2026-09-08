import Papa from "papaparse";
import { Attendee, Group, RetreatExpLevel, RETREAT_EXP_LEVELS } from "@/types";
import {
  getRetreatExpNumericValue,
  numericToRetreatExpLevel,
} from "./retreat-exp";

function parseRetreatExp(value: string | undefined): RetreatExpLevel {
  const trimmed = value?.trim() || "0";
  if (RETREAT_EXP_LEVELS.includes(trimmed as RetreatExpLevel)) {
    return trimmed as RetreatExpLevel;
  }
  return "0";
}

function parseBoolean(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "true" || normalized === "yes";
}

function getLgbtqiaValue(row: Record<string, string>): string | undefined {
  const columnName = Object.keys(row).find((header) =>
    header.toLowerCase().includes("lgbt"),
  );

  return columnName ? row[columnName] : undefined;
}

function parseAttendee(row: Record<string, string>, id: string): Attendee {
  return {
    id,
    firstName: row["First Name"]?.trim() || "",
    preferredName: row["Preferred Name"]?.trim() || "",
    lastName: row["Last Name"]?.trim() || "",
    age: parseInt(row.Age) || 0,
    gender: row.Gender?.trim() || "",
    bipoc: parseBoolean(row.BIPOC),
    lgbtqia: parseBoolean(getLgbtqiaValue(row)),
    retreatExp: parseRetreatExp(row["Retreat Experience"]),
  };
}

export function parseCSV(csvText: string): Attendee[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const attendees = result.data.map((row, index) =>
    parseAttendee(row, `attendee-${Date.now()}-${index}`),
  );

  return attendees;
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
    const member = parseAttendee(
      row,
      `attendee-${Date.now()}-${Math.random()}`,
    );

    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        id: groupId,
        members: [],
        teacherName: row.teacherName?.trim() || "",
        notes: row.groupNotes?.trim() || "",
        demographics: {
          avgAge: 0,
          avgExperience: "0",
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
    const avgExpNumeric =
      members.reduce(
        (sum, m) => sum + getRetreatExpNumericValue(m.retreatExp),
        0,
      ) / members.length;
    group.demographics = {
      avgAge: Math.round(
        members.reduce((sum, m) => sum + m.age, 0) / members.length,
      ),
      avgExperience: numericToRetreatExpLevel(avgExpNumeric),
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

  const csvData = groups.flatMap((group) => {
    return group.members.map((member) => ({
      groupId: group.id,
      teacherName: group.teacherName || "",
      groupNotes: group.notes || "",
      "First Name": member.firstName,
      "Preferred Name": member.preferredName,
      "Last Name": member.lastName,
      Age: member.age,
      Gender: member.gender,
      BIPOC: member.bipoc,
      LGBTQIA: member.lgbtqia,
      "Retreat Experience": member.retreatExp,
    }));
  });

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
