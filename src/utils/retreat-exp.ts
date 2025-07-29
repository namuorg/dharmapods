import { RetreatExpUnit } from "@/types";
import { assertUnreachable } from ".";

/**
 * Get the suffix to display after retreat experience values
 * @param unit - The retreat experience unit (retreats or days)
 * @returns "r" for retreats or "d" for days
 */
export function getRetreatExpSuffix(unit: RetreatExpUnit): string {
  if (unit === "retreats") {
    return "r";
  } else if (unit === "days") {
    return "d";
  } else {
    assertUnreachable(unit);
  }
}

/**
 * Get the maximum value for retreat experience range based on unit
 * @param unit - The retreat experience unit (retreats or days)
 * @returns 10 for retreats or 30 for days
 */
export function getRetreatExpRangeMax(unit: RetreatExpUnit): number {
  if (unit === "retreats") {
    return 10;
  } else if (unit === "days") {
    return 60;
  } else {
    assertUnreachable(unit);
  }
}
