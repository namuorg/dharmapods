import { RetreatExpLevel, RETREAT_EXP_LEVELS } from "@/types";

/**
 * Get the numeric order index for a retreat experience level (for sorting)
 */
export function getRetreatExpOrder(level: RetreatExpLevel): number {
  return RETREAT_EXP_LEVELS.indexOf(level);
}

/**
 * Get a numeric value representing the retreat experience level (for averaging)
 * Uses midpoint of each range
 */
export function getRetreatExpNumericValue(level: RetreatExpLevel): number {
  switch (level) {
    case "0":
      return 0;
    case "1-3":
      return 2;
    case "4-6":
      return 5;
    case "7+":
      return 8;
  }
}

/**
 * Convert a numeric average back to the closest retreat experience level
 */
export function numericToRetreatExpLevel(value: number): RetreatExpLevel {
  if (value < 0.5) return "0";
  if (value < 3.5) return "1-3";
  if (value < 6.5) return "4-6";
  return "7+";
}

/**
 * Get the border color intensity based on experience level
 */
export function getRetreatExpColorIndex(level: RetreatExpLevel): number {
  return getRetreatExpOrder(level);
}
