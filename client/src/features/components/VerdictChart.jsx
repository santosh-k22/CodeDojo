import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
    OK: '#10b981',             // Emerald-500
    WRONG_ANSWER: '#ef4444',   // Red-500
    TIME_LIMIT_EXCEEDED: '#f59e0b', // Amber-500
    MEMORY_LIMIT_EXCEEDED: '#f97316', // Orange-500
    COMPILATION_ERROR: '#64748b',   // Slate-500
    RUNTIME_ERROR: '#8b5cf6',       // Violet-500
    SKIPPED: '#94a3b8',             // Slate-400
};

const VerdictChart = ({ data }) => {
    const chartData = Object.keys(data).map(key => ({
        name: key.replace(/_/g, ' '),
        value: data[key],
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.replace(/ /g, '_')] || '#000000'} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default VerdictChart;