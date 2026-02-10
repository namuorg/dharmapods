import { Attendee, RETREAT_EXP_LEVELS } from "@/types";

export function getExperienceDistributionChartOptions(attendees: Attendee[]) {
  const experienceBins: Record<string, number> = {
    "0": 0,
    "1-3": 0,
    "4-6": 0,
    "7+": 0,
  };

  // Count attendees in each experience bin
  attendees.forEach((attendee) => {
    const level = attendee.retreatExp;
    if (RETREAT_EXP_LEVELS.includes(level)) {
      experienceBins[level]++;
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
