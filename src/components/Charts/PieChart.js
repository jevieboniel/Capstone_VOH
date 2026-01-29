import React from "react";
import { PieChart as RePieChart, Pie, Cell, Tooltip } from "recharts";

const PieChart = ({
  data,
  dataKey,
  nameKey = "name",
  outerRadius = 80,
  showLabels = true,
  labelFormatter, // optional custom label
  cx = "50%",
  cy = "50%",
}) => {
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <RePieChart>
      <Pie
        data={data}
        cx={cx}
        cy={cy}
        labelLine={false}
        label={
          showLabels
            ? labelFormatter ||
              (({ [nameKey]: nm, percent }) =>
                `${nm} ${(percent * 100).toFixed(0)}%`)
            : false
        }
        outerRadius={outerRadius}
        dataKey={dataKey}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>

      <Tooltip
        contentStyle={{
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
          borderRadius: "12px",
          color: isDark ? "#f3f4f6" : "#111827",
        }}
        itemStyle={{
          color: isDark ? "#f3f4f6" : "#111827",
        }}
        labelStyle={{
          color: isDark ? "#9ca3af" : "#374151",
        }}
      />
    </RePieChart>
  );
};

export default PieChart;
