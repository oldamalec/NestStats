<template>
  <div>
    <canvas
      :id="chartClass"
      width="400"
      height="400"
    />
  </div>
</template>

<script>
import {
    Chart,
    LinearScale,
    LineElement,
    LineController,
    CategoryScale,
    PointElement,
    TimeScale,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import 'chartjs-adapter-moment';
import {getHumidity, getHvac, getTemperature} from "@/firestore";

Chart.register(LinearScale, LineElement, LineController, CategoryScale, PointElement, TimeScale, Tooltip, Legend, Filler);

let width, height, gradient;

function getGradient(ctx, chartArea) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (gradient === null || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'blue');
        // gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'red');
    }

    return gradient;
}

export default {
    name: "Chart",
    data: () => ({
        chartClass: 'chart',
        chart: null,
        temperature: [],
        humidity: [],
        hvac: []
    }),
    mounted: function () {
        Promise.all([
            getTemperature().then(data => {
                this.temperature = data;
            }),
            getHumidity().then(data => {
                this.humidity = data;
            }),
            getHvac().then(data => {
                this.hvac = data
            })
        ]).then(() => {
            this.setUpChart();
        })
    },
    methods: {
        setUpChart: function () {
            this.chart = new Chart(this.chartClass, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Temperature',
                        yAxisID: 'temperature',
                        data: this.temperature,
                        backgroundColor: 'red',
                        borderColor: function (context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;

                            if (!chartArea) {
                                // This case happens on initial chart load
                                return null;
                            }
                            return getGradient(ctx, chartArea);
                        },
                    }, {
                        label: 'Humidity',
                        yAxisID: 'humidity',
                        data: this.humidity,
                        backgroundColor: 'aqua',
                        borderColor: 'aqua',
                        borderDash: [5, 5],
                    }, {
                        label: 'Heating',
                        yAxisID: 'temperature',
                        data: this.hvac,
                        stepped: true,
                        backgroundColor: 'black',
                        borderColor: 'black',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                tooltipFormat: 'll HH:mm',
                                unit: 'day',
                                displayFormats: {
                                    'day': 'DD. MM.'
                                }
                            }
                        },
                        temperature: {
                            type: 'linear',
                            position: 'left'
                        },
                        humidity: {
                            type: 'linear',
                            position: 'right',
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            position: 'nearest'
                        }
                    }
                }
            });
        }
    }
}
</script>

<style scoped>

</style>
