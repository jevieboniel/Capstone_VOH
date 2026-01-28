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
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      {showLegend ? <Legend /> : null}

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
