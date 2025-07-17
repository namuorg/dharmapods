export interface Attendee {
  id: string;
  name: string;
  age: number;
  gender: string;
  bipoc: boolean;
  lgbtqia: boolean;
  retreatExpDays: number;
}

export interface GroupDemographics {
  avgAge: number;
  genderDistribution: Record<string, number>;
  bipocCount: number;
  lgbtqiaCount: number;
  avgExperience: number;
}

export interface Group {
  id: number;
  members: Attendee[];
  demographics: GroupDemographics;
  teacherName?: string;
  notes?: string;
}

export const DEFAULT_GROUP_SIZE = 8;