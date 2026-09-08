export type RetreatExpLevel = "0" | "1-3" | "4-6" | "7+";

export const RETREAT_EXP_LEVELS: RetreatExpLevel[] = ["0", "1-3", "4-6", "7+"];

export interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  bipoc: boolean;
  lgbtqia: boolean;
  retreatExp: RetreatExpLevel;
}

export interface GroupDemographics {
  avgAge: number;
  genderDistribution: Record<string, number>;
  bipocCount: number;
  lgbtqiaCount: number;
  avgExperience: RetreatExpLevel;
}

export interface Group {
  id: number;
  members: Attendee[];
  demographics: GroupDemographics;
  teacherName?: string;
  notes?: string;
}

export const DEFAULT_GROUP_SIZE = 8;
export const DEFAULT_NUMBER_OF_GROUPS = 12;
