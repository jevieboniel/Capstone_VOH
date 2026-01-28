import React from "react";
import { ResponsiveContainer } from "recharts";

const ChartContainer = ({ title, icon: Icon, height = 300, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5" /> : null}
          {title}
        </h2>
      </div>

      <div className="px-4 py-4">
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;
