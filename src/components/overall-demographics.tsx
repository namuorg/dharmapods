"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactECharts from "echarts-for-react";
import { useAppStore } from "@/store/app-store";
import { getAgeDistributionChartOptions } from "@/utils/charts/age-chart";
import { getExperienceDistributionChartOptions } from "@/utils/charts/experience-chart";

export function OverallDemographics() {
  const { attendees, retreatExpUnit } = useAppStore();
  const [showAgeChart, setShowAgeChart] = useState(false);
  const [showExperienceChart, setShowExperienceChart] = useState(false);

  const avgAge = Math.round(
    attendees.reduce((sum, a) => sum + a.age, 0) / attendees.length,
  );

  const avgExperience = Math.round(
    attendees.reduce((sum, a) => sum + a.retreatExp, 0) / attendees.length,
  );

  const bipocCount = attendees.filter((a) => a.bipoc).length;
  const bipocPercentage = Math.round((bipocCount / attendees.length) * 100);

  const lgbtqiaCount = attendees.filter((a) => a.lgbtqia).length;
  const lgbtqiaPercentage = Math.round((lgbtqiaCount / attendees.length) * 100);

  const genderDistribution = attendees.reduce(
    (acc, a) => {
      acc[a.gender] = (acc[a.gender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="bg-muted p-4 rounded cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => {
              setShowAgeChart(!showAgeChart);
              setShowExperienceChart(false);
            }}
          >
            <h3 className="font-medium text-muted-foreground">Avg Age</h3>
            <p className="text-2xl font-bold text-slate-700">{avgAge}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view distribution
            </p>
          </div>
          <div
            className="bg-muted p-4 rounded cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => {
              setShowExperienceChart(!showExperienceChart);
              setShowAgeChart(false);
            }}
          >
            <h3 className="font-medium text-muted-foreground">
              Avg Retreat Experience
            </h3>
            <p className="text-2xl font-bold text-slate-700">
              {avgExperience} {retreatExpUnit || "retreats"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view distribution
            </p>
          </div>
          <div className="bg-muted p-4 rounded">
            <h3 className="font-medium text-muted-foreground">
              <span className="mr-2">🌍</span>BIPOC
            </h3>
            <p className="text-2xl font-bold text-slate-700">
              {bipocCount} ({bipocPercentage}%)
            </p>
          </div>
          <div className="bg-muted p-4 rounded">
            <h3 className="font-medium text-muted-foreground">
              <span className="mr-2">🏳️‍🌈</span>LGBTQIA+
            </h3>
            <p className="text-2xl font-bold text-slate-700">
              {lgbtqiaCount} ({lgbtqiaPercentage}%)
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium text-muted-foreground mb-2">
            Gender Distribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(genderDistribution).map(([gender, count]) => (
              <Badge key={gender} variant="outline" className="text-sm">
                {gender}: {count}
              </Badge>
            ))}
          </div>
        </div>
        {showAgeChart && (
          <div className="mt-6 border-t pt-6">
            <ReactECharts
              option={getAgeDistributionChartOptions(attendees)}
              style={{ height: "300px" }}
            />
          </div>
        )}
        {showExperienceChart && (
          <div className="mt-6 border-t pt-6">
            <ReactECharts
              option={getExperienceDistributionChartOptions(
                attendees,
                retreatExpUnit,
              )}
              style={{ height: "300px" }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
