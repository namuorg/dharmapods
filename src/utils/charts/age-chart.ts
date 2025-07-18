import { Attendee } from "@/types";

export function getAgeDistributionChartOptions(attendees: Attendee[]) {
  // Create age bins
  const ageBins: Record<string, number> = {
    "0-17": 0,
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56-65": 0,
    "66-75": 0,
    "76-85": 0,
    "86+": 0,
  };

  // Count attendees in each age bin
  attendees.forEach((attendee) => {
    const age = attendee.age;
    if (age >= 0 && age <= 17) ageBins["0-17"]++;
    else if (age >= 18 && age <= 25) ageBins["18-25"]++;
    else if (age >= 26 && age <= 35) ageBins["26-35"]++;
    else if (age >= 36 && age <= 45) ageBins["36-45"]++;
    else if (age >= 46 && age <= 55) ageBins["46-55"]++;
    else if (age >= 56 && age <= 65) ageBins["56-65"]++;
    else if (age >= 66 && age <= 75) ageBins["66-75"]++;
    else if (age >= 76 && age <= 85) ageBins["76-85"]++;
    else if (age >= 86) ageBins["86+"]++;
  });

  return {
    title: {
      text: "Age Distribution",
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
      data: Object.keys(ageBins),
      axisLabel: {
        interval: 0,
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
        data: Object.values(ageBins),
        itemStyle: {
          color: "#3b82f6",
        },
        label: {
          show: true,
          position: "top",
        },
      },
    ],
  };
}
