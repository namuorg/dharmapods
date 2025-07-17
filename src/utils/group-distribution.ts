import { Attendee, Group, GroupDemographics, DEFAULT_GROUP_SIZE } from "@/types";

export function calculateGroupDemographics(members: Attendee[]): GroupDemographics {
  const avgAge = members.reduce((sum, m) => sum + m.age, 0) / members.length;
  const genderDistribution = members.reduce((acc, m) => {
    acc[m.gender] = (acc[m.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bipocCount = members.filter((m) => m.bipoc).length;
  const lgbtqiaCount = members.filter((m) => m.lgbtqia).length;
  const avgExperience =
    members.reduce((sum, m) => sum + m.experienceDays, 0) / members.length;

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
  groupSize: number = DEFAULT_GROUP_SIZE
): Group[] {
  const numGroups = Math.ceil(attendees.length / groupSize);
  const groups: Attendee[][] = Array(numGroups)
    .fill(null)
    .map(() => []);

  // Step 1: Categorize attendees
  const bipocAndLgbtqia = attendees.filter((a) => a.bipoc && a.lgbtqia);
  const bipocOnly = attendees.filter((a) => a.bipoc && !a.lgbtqia);
  const lgbtqiaOnly = attendees.filter((a) => !a.bipoc && a.lgbtqia);
  const neither = attendees.filter((a) => !a.bipoc && !a.lgbtqia);

  // Helper function to shuffle an array
  const shuffle = (array: Attendee[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper function to find smallest group
  const findSmallestGroup = () => {
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

  let currentGroupIndex = 0;

  // Step 2: Seed groups with BIPOC and LGBTQIA pairs
  const shuffledBipocAndLgbtqia = shuffle(bipocAndLgbtqia);
  for (let i = 0; i < shuffledBipocAndLgbtqia.length; i += 2) {
    if (i + 1 < shuffledBipocAndLgbtqia.length) {
      // Add pair to current group
      groups[currentGroupIndex].push(shuffledBipocAndLgbtqia[i]);
      groups[currentGroupIndex].push(shuffledBipocAndLgbtqia[i + 1]);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    }
  }

  // Step 3: Seed groups with BIPOC only pairs
  const shuffledBipocOnly = shuffle(bipocOnly);
  for (let i = 0; i < shuffledBipocOnly.length; i += 2) {
    if (i + 1 < shuffledBipocOnly.length) {
      groups[currentGroupIndex].push(shuffledBipocOnly[i]);
      groups[currentGroupIndex].push(shuffledBipocOnly[i + 1]);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    }
  }

  // Step 4: Seed groups with LGBTQIA only pairs
  const shuffledLgbtqiaOnly = shuffle(lgbtqiaOnly);
  for (let i = 0; i < shuffledLgbtqiaOnly.length; i += 2) {
    if (i + 1 < shuffledLgbtqiaOnly.length) {
      groups[currentGroupIndex].push(shuffledLgbtqiaOnly[i]);
      groups[currentGroupIndex].push(shuffledLgbtqiaOnly[i + 1]);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    }
  }

  // Step 5: Place leftover individuals
  const leftovers: Attendee[] = [];

  // Leftover from BIPOC and LGBTQIA
  if (shuffledBipocAndLgbtqia.length % 2 === 1) {
    const leftover =
      shuffledBipocAndLgbtqia[shuffledBipocAndLgbtqia.length - 1];
    // Find group with existing BIPOC and LGBTQIA members
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      const hasBipoc = groups[i].some((m) => m.bipoc);
      const hasLgbtqia = groups[i].some((m) => m.lgbtqia);
      if (hasBipoc && hasLgbtqia) {
        groups[i].push(leftover);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Leftover from BIPOC only
  if (shuffledBipocOnly.length % 2 === 1) {
    const leftover = shuffledBipocOnly[shuffledBipocOnly.length - 1];
    // Find group with existing BIPOC members
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      const hasBipoc = groups[i].some((m) => m.bipoc);
      if (hasBipoc) {
        groups[i].push(leftover);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Leftover from LGBTQIA only
  if (shuffledLgbtqiaOnly.length % 2 === 1) {
    const leftover = shuffledLgbtqiaOnly[shuffledLgbtqiaOnly.length - 1];
    // Find group with existing LGBTQIA members
    let placed = false;
    for (let i = 0; i < groups.length; i++) {
      const hasLgbtqia = groups[i].some((m) => m.lgbtqia);
      if (hasLgbtqia) {
        groups[i].push(leftover);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // If no suitable group found, just continue and place in smallest group later
      leftovers.push(leftover);
    }
  }

  // Step 6: Distribute remaining attendees (neither category + any unplaced leftovers)
  const remainingAttendees = [...neither, ...leftovers];
  const shuffledRemaining = shuffle(remainingAttendees);

  for (const attendee of shuffledRemaining) {
    const smallestGroupIndex = findSmallestGroup();
    groups[smallestGroupIndex].push(attendee);
  }

  // Convert to Group objects
  return groups.map((members, index) => ({
    id: index + 1,
    members,
    demographics: calculateGroupDemographics(members),
  }));
}