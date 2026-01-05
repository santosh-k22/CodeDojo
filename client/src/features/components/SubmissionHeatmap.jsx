import React, { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from 'react-tooltip';
import api from "../../app/api";

const SubmissionHeatmap = ({ userId }) => {
    const [submissionData, setSubmissionData] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const { data } = await api.get(
                    `/profile/submissions/${userId}`
                );

                // Convert date strings to Date objects
                const formattedData = data.map((item) => ({
                    ...item,
                    date: new Date(item.date),
                }));

                setSubmissionData(formattedData);
            } catch (error) {
                console.error("Failed to fetch submission data:", error);
            }
        };

        if (userId) {
            fetchSubmissions();
        }
    }, [userId]);

    const getShiftedEndDate = () => {
        const today = new Date();
        today.setDate(today.getDate());
        return today;
    };

    const shiftedEndDate = getShiftedEndDate();
    const shiftedStartDate = new Date(shiftedEndDate);
    shiftedStartDate.setFullYear(shiftedEndDate.getFullYear() - 1);

    return (
        <div className="heatmap-container">
            <h3>Submission Activity</h3>
            <CalendarHeatmap
                startDate={shiftedStartDate}
                endDate={shiftedEndDate}
                values={submissionData}
                classForValue={(value) => {
                    if (!value) {
                        return "color-empty";
                    }
                    return `color-scale-${Math.min(value.count, 4)}`;
                }}
                tooltipDataAttrs={(value) => {
                    return {
                        "data-tip": `${value.date ? value.date.toISOString().slice(0, 10) : "No date"
                            }: ${value.count || 0} submissions`,
                    };
                }}
            />
            <Tooltip />
        </div>
    );
};

export default SubmissionHeatmap;
