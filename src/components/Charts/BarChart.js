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
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey={xKey}
        angle={typeof xAngle === "number" ? xAngle : 0}
        textAnchor={typeof xAngle === "number" ? "end" : "middle"}
        height={xHeight || (typeof xAngle === "number" ? 80 : undefined)}
      />
      <YAxis />
      <Tooltip />
      {showLegend ? <Legend /> : null}

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
