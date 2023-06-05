import React from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { useColorModeValue } from "@chakra-ui/react";
import theme from "../theme";

export default function LineChart() {
    const legendColor = useColorModeValue(theme.colors.blackAlpha[700], theme.colors.whiteAlpha[900]);
    const axisBorderColor = useColorModeValue(theme.colors.blackAlpha[200], theme.colors.whiteAlpha[700]);

    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

    Chart.register({
        id: "verticalLineId", // crashes without id
        afterDraw: (chart) => {
            // eslint-disable-next-line no-underscore-dangle
            if (chart.tooltip._active && chart.tooltip._active.length) {
                // eslint-disable-next-line no-underscore-dangle
                const activePoint = chart.tooltip._active[0];
                const { ctx } = chart;
                const { x } = activePoint.element;
                const topY = chart.scales.y.top;
                const bottomY = chart.scales.y.bottom;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "lightgray";
                ctx.stroke();
                ctx.restore();
            }
        },
    });

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: legendColor,
                },
            },
            title: {
                display: true,
                text: "Ethereum prediction",
                color: legendColor,
            },
            tooltip: {
                cornerRadius: 1,
                caretSize: 3,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || "";
                        if (label) {
                            label += ": ";
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(context.parsed.y);
                        }
                        return label;
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: legendColor,
                },
                border: {
                    color: axisBorderColor,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: legendColor,
                },
                border: {
                    color: axisBorderColor,
                },
            },
        },
    };

    const labels = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032"];

    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: "Price",
                data: [2299, 3438, 4805, 7050, 10244, 15325, 22263, 32035, 45210, 66342],
                borderWidth: 2,
                borderColor: theme.colors.green300[500],
                backgroundColor: theme.colors.green300[100],
            },
        ],
    };

    return <Line id="chart" options={options} data={data} />;
}
