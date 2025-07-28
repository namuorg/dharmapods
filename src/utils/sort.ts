import { Attendee } from "@/types";

export type SortOption = "name" | "gender" | "experience" | "age";

export function sortMembers(
  members: Attendee[],
  sortBy: SortOption,
): Attendee[] {
  const sorted = [...members];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "gender":
      return sorted.sort((a, b) => a.gender.localeCompare(b.gender));

    case "experience":
      return sorted.sort((a, b) => a.retreatExp - b.retreatExp);

    case "age":
      return sorted.sort((a, b) => a.age - b.age);

    default:
      return sorted;
  }
}
