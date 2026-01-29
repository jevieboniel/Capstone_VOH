import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const BarChart = ({
  data,
  xKey,
  bars = [], // [{ key: "count", fill: "#3b82f6", name: "Count", stackId?: "a" }]
  showLegend = false,
  xAngle,
  xHeight,
}) => {
  return (
    <ReBarChart data={data}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#e5e7eb"
        className="dark:stroke-gray-700"
      />

      <XAxis
        dataKey={xKey}
        angle={typeof xAngle === "number" ? xAngle : 0}
        textAnchor={typeof xAngle === "number" ? "end" : "middle"}
        height={xHeight || (typeof xAngle === "number" ? 80 : undefined)}
        stroke="#6b7280"
        tick={{ fill: "#6b7280" }}
        className="dark:stroke-gray-400"
      />

      <YAxis
        stroke="#6b7280"
        tick={{ fill: "#6b7280" }}
        className="dark:stroke-gray-400"
      />

      <Tooltip
        contentStyle={{
          backgroundColor: "var(--tooltip-bg, #ffffff)",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
        wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:text-gray-200"
      />

      {showLegend ? (
        <Legend
          wrapperStyle={{ color: "#374151" }}
          className="dark:text-gray-300"
        />
      ) : null}

      {bars.map((b, idx) => (
        <Bar
          key={b.key || idx}
          dataKey={b.key}
          fill={b.fill}
          name={b.name}
          stackId={b.stackId}
        />
      ))}
    </ReBarChart>
  );
};

export default BarChart;
