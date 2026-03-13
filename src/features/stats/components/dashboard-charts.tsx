"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface EnrollmentTrendChartProps {
  data: { month: string; count: number }[];
}

export function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  return (
    <div className="h-[300px] w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              padding: "12px",
            }}
            itemStyle={{ color: "#6366f1", fontWeight: "bold" }}
            labelStyle={{
              color: "#1e293b",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#enrollmentGradient)"
            animationDuration={2000}
            dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopCoursesChartProps {
  data: { title: string; students: number }[];
}

export function TopCoursesChart({ data }: TopCoursesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
        <p className="font-medium">No enrollment data available</p>
        <p className="text-xs">Start selling courses to see analytics</p>
      </div>
    );
  }

  // Truncate long titles for the YAxis
  const formattedData = data.map((item) => ({
    ...item,
    shortTitle:
      item.title.length > 20 ? item.title.substring(0, 17) + "..." : item.title,
  }));

  return (
    <div className="h-[300px] w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <XAxis type="number" hide />
          <YAxis
            dataKey="shortTitle"
            type="category"
            axisLine={false}
            tickLine={false}
            width={140}
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9", radius: 8 }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              padding: "12px",
            }}
            formatter={(value: number) => [`${value} Students`, "Enrollment"]}
            labelStyle={{ display: "none" }}
          />
          <Bar
            dataKey="students"
            fill="url(#barGradient)"
            radius={[0, 10, 10, 0]}
            barSize={24}
            animationDuration={2000}
            label={{
              position: "right",
              fill: "#64748b",
              fontSize: 12,
              fontWeight: 600,
              formatter: (val: number) => (val > 0 ? val : ""),
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
