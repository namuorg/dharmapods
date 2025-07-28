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
      "1-7 days": 0,
      "8-14 days": 0,
      "15-30 days": 0,
      "31-90 days": 0,
      "91-180 days": 0,
      "181-365 days": 0,
      "1+ years": 0,
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
      else if (value >= 1 && value <= 7) experienceBins["1-7 days"]++;
      else if (value >= 8 && value <= 14) experienceBins["8-14 days"]++;
      else if (value >= 15 && value <= 30) experienceBins["15-30 days"]++;
      else if (value >= 31 && value <= 90) experienceBins["31-90 days"]++;
      else if (value >= 91 && value <= 180) experienceBins["91-180 days"]++;
      else if (value >= 181 && value <= 365) experienceBins["181-365 days"]++;
      else if (value > 365) experienceBins["1+ years"]++;
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
