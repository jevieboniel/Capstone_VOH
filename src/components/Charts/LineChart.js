import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const LineChart = ({
  data,
  xKey,
  lines = [], // [{ key: "avgScore", stroke:"#3b82f6", name:"Average Score" }]
  showLegend = true,
}) => {
  return (
    <ReLineChart data={data}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="currentColor"
        className="text-gray-200 dark:text-gray-700"
      />

      <XAxis
        dataKey={xKey}
        stroke="currentColor"
        className="text-gray-600 dark:text-gray-400"
      />

      <YAxis
        stroke="currentColor"
        className="text-gray-600 dark:text-gray-400"
      />

      <Tooltip
        contentStyle={{
          backgroundColor: "var(--tooltip-bg, white)",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
        labelStyle={{ color: "#111827" }}
      />

      {showLegend ? (
        <Legend wrapperStyle={{ color: "#6b7280" }} />
      ) : null}

      {lines.map((l, idx) => (
        <Line
          key={l.key || idx}
          type="monotone"
          dataKey={l.key}
          stroke={l.stroke}
          name={l.name}
        />
      ))}
    </ReLineChart>
  );
};

export default LineChart;
