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
        <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
            <ReAreaChart data={data}>
            <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-gray-700"
            />

            <XAxis
                dataKey={xKey}
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

            {showLegend && (
                <Legend
                wrapperStyle={{
                    color: "#374151",
                }}
                className="dark:text-gray-300"
                />
            )}

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
        </div>
    );
    };

    export default AreaChart;
