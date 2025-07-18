import { Attendee } from "@/types";

export function getExperienceDistributionChartOptions(attendees: Attendee[]) {
  // Create experience bins
  const experienceBins: Record<string, number> = {
    "0 days": 0,
    "1-7 days": 0,
    "8-14 days": 0,
    "15-30 days": 0,
    "31-90 days": 0,
    "91-180 days": 0,
    "181-365 days": 0,
    "1+ years": 0,
  };

  // Count attendees in each experience bin
  attendees.forEach((attendee) => {
    const days = attendee.retreatExpDays;
    if (days === 0) experienceBins["0 days"]++;
    else if (days >= 1 && days <= 7) experienceBins["1-7 days"]++;
    else if (days >= 8 && days <= 14) experienceBins["8-14 days"]++;
    else if (days >= 15 && days <= 30) experienceBins["15-30 days"]++;
    else if (days >= 31 && days <= 90) experienceBins["31-90 days"]++;
    else if (days >= 91 && days <= 180) experienceBins["91-180 days"]++;
    else if (days >= 181 && days <= 365) experienceBins["181-365 days"]++;
    else if (days > 365) experienceBins["1+ years"]++;
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
