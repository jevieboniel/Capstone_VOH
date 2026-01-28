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
              (({ [nameKey]: nm, percent }) => `${nm} ${(percent * 100).toFixed(0)}%`)
            : false
        }
        outerRadius={outerRadius}
        dataKey={dataKey}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </RePieChart>
  );
};

export default PieChart;
