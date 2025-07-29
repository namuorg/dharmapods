import { Attendee, RetreatExpUnit } from "@/types";

export function getExperienceDistributionChartOptions(
  attendees: Attendee[],
  unit: RetreatExpUnit = "retreats",
) {
  // Create experience bins based on unit
  let experienceBins: Record<string, number>;

  if (unit === "retreats") {
    experienceBins = {
      "0 retreats": 0,
      "1 retreat": 0,
      "2-3 retreats": 0,
      "4-6 retreats": 0,
      "7-10 retreats": 0,
      "11+ retreats": 0,
    };
  } else {
    experienceBins = {
      "0 days": 0,
      "1-3 days": 0,
      "4-10 days": 0,
      "11-30 days": 0,
      "31-60 days": 0,
      "61-100 days": 0,
      "100+ days": 0,
    };
  }

  // Count attendees in each experience bin
  attendees.forEach((attendee) => {
    const value = attendee.retreatExp;

    if (unit === "retreats") {
      if (value === 0) experienceBins["0 retreats"]++;
      else if (value === 1) experienceBins["1 retreat"]++;
      else if (value >= 2 && value <= 3) experienceBins["2-3 retreats"]++;
      else if (value >= 4 && value <= 6) experienceBins["4-6 retreats"]++;
      else if (value >= 7 && value <= 10) experienceBins["7-10 retreats"]++;
      else if (value >= 11) experienceBins["11+ retreats"]++;
    } else {
      if (value === 0) experienceBins["0 days"]++;
      else if (value >= 1 && value <= 3) experienceBins["1-3 days"]++;
      else if (value >= 4 && value <= 10) experienceBins["4-10 days"]++;
      else if (value >= 11 && value <= 30) experienceBins["11-30 days"]++;
      else if (value >= 31 && value <= 60) experienceBins["31-60 days"]++;
      else if (value >= 61 && value <= 100) experienceBins["61-100 days"]++;
      else if (value > 100) experienceBins["100+ days"]++;
    }
  });

  return {
    title: {
      text: "Retreat Experience Distribution",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "category",
      data: Object.keys(experienceBins),
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      name: "Number of Attendees",
    },
    series: [
      {
        name: "Attendees",
        type: "bar",
        data: Object.values(experienceBins),
        itemStyle: {
          color: "#10b981",
        },
        label: {
          show: true,
          position: "top",
        },
      },
    ],
  };
}
