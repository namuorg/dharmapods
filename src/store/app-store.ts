import { create } from "zustand";
import { Attendee, Group } from "@/types";
import { SortOption } from "@/utils/sort";
import { DEFAULT_NUMBER_OF_GROUPS } from "@/types";
import { calculateGroupDemographics } from "@/utils/group-distribution";

interface AppState {
  // State
  attendees: Attendee[];
  groups: Group[];
  numGroups: number;
  sortBy: SortOption;
  filterByTeacher: string;
  avoidSoloAffinity: boolean;
  visibleFields: Set<string>;

  // Actions
  setAttendees: (attendees: Attendee[]) => void;
  setGroups: (groups: Group[]) => void;
  setNumGroups: (numGroups: number) => void;
  setSortBy: (sortBy: SortOption) => void;
  setFilterByTeacher: (filter: string) => void;
  setAvoidSoloAffinity: (avoid: boolean) => void;
  setVisibleFields: (fields: Set<string>) => void;
  updateGroup: (groupId: number, updates: Partial<Group>) => void;
  updateGroupTeacherName: (groupId: number, teacherName: string) => void;
  updateGroupNotes: (groupId: number, notes: string) => void;
  moveMemberBetweenGroups: (
    memberId: string,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex?: number,
  ) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  attendees: [],
  groups: [],
  numGroups: DEFAULT_NUMBER_OF_GROUPS,
  sortBy: "name",
  filterByTeacher: "all",
  avoidSoloAffinity: true,
  visibleFields: new Set(["bipoc", "lgbtqia", "gender", "experience", "age"]),

  // Actions
  setAttendees: (attendees) => set({ attendees }),
  setGroups: (groups) => set({ groups }),
  setNumGroups: (numGroups) => set({ numGroups }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterByTeacher: (filterByTeacher) => set({ filterByTeacher }),
  setAvoidSoloAffinity: (avoidSoloAffinity) => set({ avoidSoloAffinity }),
  setVisibleFields: (visibleFields) => set({ visibleFields }),

  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group,
      ),
    })),

  updateGroupTeacherName: (groupId, teacherName) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, teacherName } : group,
      ),
    })),

  updateGroupNotes: (groupId, notes) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, notes } : group,
      ),
    })),

  moveMemberBetweenGroups: (
    memberId,
    sourceGroupId,
    targetGroupId,
    targetIndex,
  ) =>
    set((state) => {
      const newGroups = [...state.groups];
      const sourceGroup = newGroups.find((g) => g.id === sourceGroupId);
      const targetGroup = newGroups.find((g) => g.id === targetGroupId);

      if (!sourceGroup || !targetGroup) return state;

      const memberIndex = sourceGroup.members.findIndex(
        (m) => m.id === memberId,
      );
      if (memberIndex === -1) return state;

      const memberToMove = sourceGroup.members[memberIndex];

      // Remove from source
      sourceGroup.members.splice(memberIndex, 1);

      // Add to target at specific position
      if (targetIndex !== undefined) {
        // If moving within the same group, adjust index if needed
        const adjustedIndex =
          sourceGroupId === targetGroupId && targetIndex > memberIndex
            ? targetIndex - 1
            : targetIndex;
        targetGroup.members.splice(adjustedIndex, 0, memberToMove);
      } else {
        // Default behavior: add to end
        targetGroup.members.push(memberToMove);
      }

      sourceGroup.demographics = calculateGroupDemographics(
        sourceGroup.members,
      );
      targetGroup.demographics = calculateGroupDemographics(
        targetGroup.members,
      );

      return { groups: newGroups };
    }),
}));
