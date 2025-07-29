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
    members.reduce((sum, m) => sum + m.retreatExp, 0) / members.length;

  return {
    avgAge: Math.round(avgAge),
    genderDistribution,
    bipocCount,
    lgbtqiaCount,
    avgExperience: Math.round(avgExperience),
  };
}

interface AffinityUnit {
  members: Attendee[];
  avgExperience: number;
  affinityType: "bipoc-and-lgbtqia" | "bipoc-only" | "lgbtqia-only";
}

interface DistributeIntoGroupsParams {
  attendees: Attendee[];
  numGroups: number;
  avoidSoloAffinity?: boolean;
  groupingMethod?: "experience" | "random";
}

/**
 * Distributes attendees into groups with the following goals:
 * 1. Maintain similar experience levels within each group
 * 2. Keep affinity members (BIPOC/LGBTQIA+) paired together by matching types
 * 3. Ensure even distribution of group sizes
 * 4. Create a natural progression of experience levels across groups
 *    (Group 1: least experienced → Group N: most experienced)
 */
export function distributeIntoGroups({
  attendees,
  numGroups,
  avoidSoloAffinity = true,
  groupingMethod = "experience",
}: DistributeIntoGroupsParams): Group[] {
  // Step 1: Sort attendees based on grouping method
  let sortedAttendees: Attendee[];

  if (groupingMethod === "random") {
    // Shuffle array for random distribution
    sortedAttendees = [...attendees];
    for (let i = sortedAttendees.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sortedAttendees[i], sortedAttendees[j]] = [
        sortedAttendees[j],
        sortedAttendees[i],
      ];
    }
  } else {
    // Sort by experience for experience-based grouping
    sortedAttendees = [...attendees].sort(
      (a, b) => a.retreatExp - b.retreatExp,
    );
  }

  // Step 2: If avoidSoloAffinity is disabled, use simple distribution
  if (!avoidSoloAffinity) {
    // Simply distribute sorted/shuffled attendees evenly into groups
    const groups: Attendee[][] = Array(numGroups)
      .fill(null)
      .map(() => []);

    // Calculate group sizes for even distribution
    const totalMembers = attendees.length;
    const baseGroupSize = Math.floor(totalMembers / numGroups);
    const numLargerGroups = totalMembers % numGroups;

    let currentIndex = 0;
    for (let i = 0; i < numGroups; i++) {
      const groupSize = i < numLargerGroups ? baseGroupSize + 1 : baseGroupSize;
      for (
        let j = 0;
        j < groupSize && currentIndex < sortedAttendees.length;
        j++
      ) {
        groups[i].push(sortedAttendees[currentIndex++]);
      }
    }

    // Convert to Group objects
    return groups.map((members, index) => ({
      id: index + 1,
      members,
      demographics: calculateGroupDemographics(members),
    }));
  }

  // Step 2: Categorize attendees by affinity type (only if avoidSoloAffinity is true)
  const bipocAndLgbtqia = sortedAttendees.filter((a) => a.bipoc && a.lgbtqia);
  const bipocOnly = sortedAttendees.filter((a) => a.bipoc && !a.lgbtqia);
  const lgbtqiaOnly = sortedAttendees.filter((a) => !a.bipoc && a.lgbtqia);
  const nonAffinityMembers = sortedAttendees.filter(
    (a) => !a.bipoc && !a.lgbtqia,
  );

  // Step 3: Create affinity pairs/groups based on experience and affinity type
  const affinityUnits: AffinityUnit[] = [];

  // Helper function to create pairs/groups
  const createAffinityUnits = (
    members: Attendee[],
    affinityType: "bipoc-and-lgbtqia" | "bipoc-only" | "lgbtqia-only",
  ) => {
    // For random grouping, members are already shuffled; for experience-based, sort them
    const sortedMembers =
      groupingMethod === "random"
        ? [...members] // Already shuffled, just copy
        : [...members].sort((a, b) => a.retreatExp - b.retreatExp);

    for (let i = 0; i < sortedMembers.length; i += 2) {
      if (i + 1 < sortedMembers.length) {
        // Create pair
        const pair = [sortedMembers[i], sortedMembers[i + 1]];
        const avgExp = (pair[0].retreatExp + pair[1].retreatExp) / 2;
        affinityUnits.push({
          members: pair,
          avgExperience: avgExp,
          affinityType,
        });
      } else {
        // Handle leftover - try to find a compatible pair to make a group of 3
        let added = false;

        // Look for the most recent unit with the same affinity type
        for (let j = affinityUnits.length - 1; j >= 0; j--) {
          const unit = affinityUnits[j];
          // Check if all members in the unit have the same affinity type as the leftover
          const leftover = sortedMembers[i];
          const isCompatible = unit.members.every(
            (m) => m.bipoc === leftover.bipoc && m.lgbtqia === leftover.lgbtqia,
          );

          if (isCompatible && unit.members.length === 2) {
            unit.members.push(leftover);
            // Recalculate average experience
            unit.avgExperience =
              unit.members.reduce((sum, m) => sum + m.retreatExp, 0) /
              unit.members.length;
            added = true;
            break;
          }
        }

        if (!added) {
          // If no compatible pair found, create a single-person unit
          affinityUnits.push({
            members: [sortedMembers[i]],
            avgExperience: sortedMembers[i].retreatExp,
            affinityType,
          });
        }
      }
    }
  };

  // Create affinity units for each category
  createAffinityUnits(bipocAndLgbtqia, "bipoc-and-lgbtqia");
  createAffinityUnits(bipocOnly, "bipoc-only");
  createAffinityUnits(lgbtqiaOnly, "lgbtqia-only");

  // Sort affinity units only for experience-based grouping
  if (groupingMethod === "experience") {
    // Sort by average experience for experience-based grouping
    affinityUnits.sort((a, b) => a.avgExperience - b.avgExperience);
  }
  // For random grouping, affinity units are already in random order

  // Step 4: Create a combined list
  const combinedList: (Attendee | AffinityUnit)[] = [];

  if (groupingMethod === "random") {
    // For random grouping, combine affinity units and non-affinity members (both already random)
    combinedList.push(...affinityUnits);
    combinedList.push(...nonAffinityMembers);

    // Shuffle the combined list to mix affinity units and non-affinity members
    for (let i = combinedList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combinedList[i], combinedList[j]] = [combinedList[j], combinedList[i]];
    }
  } else {
    // For experience-based grouping, merge based on experience
    let affinityIndex = 0;
    let nonAffinityIndex = 0;

    while (
      affinityIndex < affinityUnits.length ||
      nonAffinityIndex < nonAffinityMembers.length
    ) {
      const currentAffinity = affinityUnits[affinityIndex];
      const currentNonAffinity = nonAffinityMembers[nonAffinityIndex];

      if (!currentNonAffinity) {
        // Only affinity units left
        combinedList.push(currentAffinity);
        affinityIndex++;
      } else if (!currentAffinity) {
        // Only non-affinity members left
        combinedList.push(currentNonAffinity);
        nonAffinityIndex++;
      } else {
        // Compare average experience
        if (currentAffinity.avgExperience <= currentNonAffinity.retreatExp) {
          combinedList.push(currentAffinity);
          affinityIndex++;
        } else {
          combinedList.push(currentNonAffinity);
          nonAffinityIndex++;
        }
      }
    }
  }

  // Step 5: Distribute into groups
  const groups: Attendee[][] = Array(numGroups)
    .fill(null)
    .map(() => []);

  // Calculate group sizes for even distribution
  const totalMembers = attendees.length;
  const baseGroupSize = Math.floor(totalMembers / numGroups);
  const numLargerGroups = totalMembers % numGroups;

  // Create array of target sizes for each group
  const targetSizes: number[] = [];
  for (let i = 0; i < numGroups; i++) {
    targetSizes[i] = i < numLargerGroups ? baseGroupSize + 1 : baseGroupSize;
  }

  // Distribute items from combined list by filling groups sequentially
  // This keeps members of similar experience together
  let currentGroupIndex = 0;

  // Keep track of items we've processed
  const processedIndices = new Set<number>();

  for (let i = 0; i < combinedList.length; i++) {
    if (processedIndices.has(i)) continue;

    const item = combinedList[i];
    const itemSize = "members" in item ? item.members.length : 1;
    const currentGroupSize = groups[currentGroupIndex].length;
    const remainingSpace = targetSizes[currentGroupIndex] - currentGroupSize;

    // If this item fits in the current group, add it
    if (itemSize <= remainingSpace) {
      if ("members" in item) {
        groups[currentGroupIndex].push(...item.members);
      } else {
        groups[currentGroupIndex].push(item);
      }
      processedIndices.add(i);
    } else if (currentGroupIndex < numGroups - 1) {
      // Item doesn't fit and we have more groups available

      // If it's an affinity unit, first try to fill the remaining space with non-affinity individuals
      if ("members" in item && remainingSpace > 0) {
        // Look ahead for non-affinity individuals to fill the gap
        for (let j = i + 1; j < combinedList.length; j++) {
          if (processedIndices.has(j)) continue;

          const futureItem = combinedList[j];
          if (!("members" in futureItem)) {
            // It's a non-affinity individual
            if (
              groups[currentGroupIndex].length < targetSizes[currentGroupIndex]
            ) {
              groups[currentGroupIndex].push(futureItem);
              processedIndices.add(j);

              // If we've filled the group, stop looking
              if (
                groups[currentGroupIndex].length >=
                targetSizes[currentGroupIndex]
              ) {
                break;
              }
            }
          }
        }
      }

      // Move to next group
      currentGroupIndex++;

      // Add the current item to the new group
      if ("members" in item) {
        groups[currentGroupIndex].push(...item.members);
      } else {
        groups[currentGroupIndex].push(item);
      }
      processedIndices.add(i);
    } else {
      // Last group - add item even if it exceeds target size
      if ("members" in item) {
        groups[currentGroupIndex].push(...item.members);
      } else {
        groups[currentGroupIndex].push(item);
      }
      processedIndices.add(i);
    }
  }

  // Convert to Group objects
  return groups.map((members, index) => ({
    id: index + 1,
    members,
    demographics: calculateGroupDemographics(members),
  }));
}
