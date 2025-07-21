import { Attendee, Group, GroupDemographics } from "@/types";

export function calculateGroupDemographics(
  members: Attendee[],
): GroupDemographics {
  const avgAge = members.reduce((sum, m) => sum + m.age, 0) / members.length;
  const genderDistribution = members.reduce(
    (acc, m) => {
      acc[m.gender] = (acc[m.gender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const bipocCount = members.filter((m) => m.bipoc).length;
  const lgbtqiaCount = members.filter((m) => m.lgbtqia).length;
  const avgExperience =
    members.reduce((sum, m) => sum + m.retreatExpDays, 0) / members.length;

  return {
    avgAge: Math.round(avgAge),
    genderDistribution,
    bipocCount,
    lgbtqiaCount,
    avgExperience: Math.round(avgExperience),
  };
}

export function distributeIntoGroups(
  attendees: Attendee[],
  numGroups: number,
): Group[] {
  const groups: Attendee[][] = Array(numGroups)
    .fill(null)
    .map(() => []);

  // Calculate group sizes for even distribution
  const baseGroupSize = Math.floor(attendees.length / numGroups);
  const numLargerGroups = attendees.length % numGroups;

  // Create array of target sizes for each group
  const targetSizes: number[] = [];
  for (let i = 0; i < numGroups; i++) {
    targetSizes[i] = i < numLargerGroups ? baseGroupSize + 1 : baseGroupSize;
  }

  // Step 1: Categorize attendees
  const bipocAndLgbtqia = attendees.filter((a) => a.bipoc && a.lgbtqia);
  const bipocOnly = attendees.filter((a) => a.bipoc && !a.lgbtqia);
  const lgbtqiaOnly = attendees.filter((a) => !a.bipoc && a.lgbtqia);
  const neither = attendees.filter((a) => !a.bipoc && !a.lgbtqia);

  let currentGroupIndex = 0;

  // Helper function to find next available group that can accept members
  const findNextAvailableGroup = (numMembers: number = 1) => {
    const startIndex = currentGroupIndex;
    do {
      if (
        groups[currentGroupIndex].length + numMembers <=
        targetSizes[currentGroupIndex]
      ) {
        return currentGroupIndex;
      }
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    } while (currentGroupIndex !== startIndex);
    // If no group has space, return the smallest group
    let smallestIndex = 0;
    let smallestSize = groups[0].length;
    for (let i = 1; i < groups.length; i++) {
      if (groups[i].length < smallestSize) {
        smallestSize = groups[i].length;
        smallestIndex = i;
      }
    }
    return smallestIndex;
  };

  // Step 2: Seed groups with BIPOC and LGBTQIA pairs (sorted by experience)
  const sortedBipocAndLgbtqia = bipocAndLgbtqia.sort(
    (a, b) => a.retreatExpDays - b.retreatExpDays,
  );
  for (let i = 0; i < sortedBipocAndLgbtqia.length; i += 2) {
    if (i + 1 < sortedBipocAndLgbtqia.length) {
      // Find group that can accept a pair
      const groupIndex = findNextAvailableGroup(2);
      groups[groupIndex].push(sortedBipocAndLgbtqia[i]);
      groups[groupIndex].push(sortedBipocAndLgbtqia[i + 1]);
      currentGroupIndex = (groupIndex + 1) % numGroups;
    }
  }

  // Step 3: Seed groups with BIPOC only pairs (sorted by experience)
  const sortedBipocOnly = bipocOnly.sort(
    (a, b) => a.retreatExpDays - b.retreatExpDays,
  );
  for (let i = 0; i < sortedBipocOnly.length; i += 2) {
    if (i + 1 < sortedBipocOnly.length) {
      const groupIndex = findNextAvailableGroup(2);
      groups[groupIndex].push(sortedBipocOnly[i]);
      groups[groupIndex].push(sortedBipocOnly[i + 1]);
      currentGroupIndex = (groupIndex + 1) % numGroups;
    }
  }

  // Step 4: Seed groups with LGBTQIA only pairs (sorted by experience)
  const sortedLgbtqiaOnly = lgbtqiaOnly.sort(
    (a, b) => a.retreatExpDays - b.retreatExpDays,
  );
  for (let i = 0; i < sortedLgbtqiaOnly.length; i += 2) {
    if (i + 1 < sortedLgbtqiaOnly.length) {
      const groupIndex = findNextAvailableGroup(2);
      groups[groupIndex].push(sortedLgbtqiaOnly[i]);
      groups[groupIndex].push(sortedLgbtqiaOnly[i + 1]);
      currentGroupIndex = (groupIndex + 1) % numGroups;
    }
  }

  // Step 5: Place leftover individuals
  const leftovers: Attendee[] = [];

  // Leftover from BIPOC and LGBTQIA
  if (sortedBipocAndLgbtqia.length % 2 === 1) {
    const leftover = sortedBipocAndLgbtqia[sortedBipocAndLgbtqia.length - 1];
    // Find the last group with BIPOC and LGBTQIA members (most experienced)
    let lastGroupIndex = -1;

    for (let i = groups.length - 1; i >= 0; i--) {
      const hasBipoc = groups[i].some((m) => m.bipoc);
      const hasLgbtqia = groups[i].some((m) => m.lgbtqia);
      if (hasBipoc && hasLgbtqia && groups[i].length > 0) {
        lastGroupIndex = i;
        break;
      }
    }

    if (lastGroupIndex !== -1) {
      groups[lastGroupIndex].push(leftover);
    } else {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Leftover from BIPOC only
  if (sortedBipocOnly.length % 2 === 1) {
    const leftover = sortedBipocOnly[sortedBipocOnly.length - 1];
    // Find the last group with BIPOC members (most experienced)
    let lastGroupIndex = -1;

    for (let i = groups.length - 1; i >= 0; i--) {
      const hasBipoc = groups[i].some((m) => m.bipoc);
      if (hasBipoc && groups[i].length > 0) {
        lastGroupIndex = i;
        break;
      }
    }

    if (lastGroupIndex !== -1) {
      groups[lastGroupIndex].push(leftover);
    } else {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Leftover from LGBTQIA only
  if (sortedLgbtqiaOnly.length % 2 === 1) {
    const leftover = sortedLgbtqiaOnly[sortedLgbtqiaOnly.length - 1];
    // Find the last group with LGBTQIA members (most experienced)
    let lastGroupIndex = -1;

    for (let i = groups.length - 1; i >= 0; i--) {
      const hasLgbtqia = groups[i].some((m) => m.lgbtqia);
      if (hasLgbtqia && groups[i].length > 0) {
        lastGroupIndex = i;
        break;
      }
    }

    if (lastGroupIndex !== -1) {
      groups[lastGroupIndex].push(leftover);
    } else {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Step 6: Distribute remaining attendees (neither category + any unplaced leftovers)
  const remainingAttendees = [...neither, ...leftovers];
  // Sort by experience to maintain experience-based grouping
  const sortedRemaining = remainingAttendees.sort(
    (a, b) => a.retreatExpDays - b.retreatExpDays,
  );

  // Fill groups with remaining attendees of similar experience
  for (const attendee of sortedRemaining) {
    // Find the first group that hasn't reached its target size
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length < targetSizes[i]) {
        groups[i].push(attendee);
        placed = true;
        break;
      }
    }
    // If all groups are at target size, add to the smallest group
    if (!placed) {
      let smallestIndex = 0;
      let smallestSize = groups[0].length;
      for (let i = 1; i < groups.length; i++) {
        if (groups[i].length < smallestSize) {
          smallestSize = groups[i].length;
          smallestIndex = i;
        }
      }
      groups[smallestIndex].push(attendee);
    }
  }

  // Convert to Group objects
  return groups.map((members, index) => ({
    id: index + 1,
    members,
    demographics: calculateGroupDemographics(members),
  }));
}
