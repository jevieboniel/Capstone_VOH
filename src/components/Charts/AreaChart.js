import React from "react";
import {
    AreaChart as ReAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    } from "recharts";

    const AreaChart = ({
    data = [],
    xKey = "month",
    areas = [{ key: "amount", stroke: "#10b981", fill: "#10b981", name: "Amount ($)" }],
    height = 300,
    showLegend = false,
    }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
        <ReAreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {areas.map((a) => (
            <Area
                key={a.key}
                type="monotone"
                dataKey={a.key}
                stroke={a.stroke}
                fill={a.fill}
                fillOpacity={a.fillOpacity ?? 0.3}
                name={a.name}
            />
            ))}
        </ReAreaChart>
        </ResponsiveContainer>
    );
};

export default AreaChart;
