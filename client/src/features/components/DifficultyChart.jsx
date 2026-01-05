import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getHandleColor } from '../../utils/codeforcesColors';

const RatingDistributionChart = ({ data }) => {
    // Transform data object { "800": 10, "900": 5 } into array sorted by rating
    const chartData = Object.keys(data || {})
        .map(key => ({
            name: key,
            value: data[key]
        }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div style={{ width: '100%', height: 300 }}>
            {chartData.length > 0 ? (
                <ResponsiveContainer>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getHandleColor(parseInt(entry.name))} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    No rating data available
                </div>
            )}
            <div className="text-center mt-2 text-muted small">
                Total Solved: {total}
            </div>
        </div>
    );
};



export default RatingDistributionChart;
