import _ = require("lodash");
import * as moment from "moment";
import * as Chart from "chart.js";
import {ChartConfiguration, ChartData, ChartDataSets, ChartPoint, LinearTickOptions} from "chart.js";

function formatHours(ms: number): string {
	const hours = ms / 1000 / 60 / 60;
	return Math.round(hours * 10) / 10 + 'h';
}

function get2dCanvasContext(id: string): CanvasRenderingContext2D {
	return (document.getElementById(id) as HTMLCanvasElement).getContext('2d');
}

function convertToData(raw: { [key: string]: number }) {
	return _(raw)
			.toPairs()
			.map((pair: [string, number]) => {
				return {x: new Date(pair[0]).getTime(), y: pair[1]} as ChartPoint;
			})
			.sortBy((cp: ChartPoint) => cp.x)
			.value();
}

$(() => {

	const defaultChartOptions: ChartConfiguration = {
		type: 'line',
		options: {
			tooltips: {
				callbacks: {
					title: (item) => moment(item[0].xLabel).format("YYYY-MM-DD"),
					label: (item) => formatHours(parseInt(item.yLabel))
				}
			},
			scales: {
				xAxes: [{
					type: 'time'
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: formatHours
					} as LinearTickOptions
				}]
			},
			maintainAspectRatio: false
		}
	};

	new Chart(get2dCanvasContext('sleepGraph'), _.merge(_.cloneDeep(defaultChartOptions), {
		data: {
			datasets: [
				{
					label: 'Sleep/day',
					data: convertToData(window.Tracker.rolling1DayTotals['Sleeping']),
					borderColor: 'rgba(3, 169, 244, 1.0)',
					borderWidth: 2,
					backgroundColor: 'transparent',
					pointRadius: 0
				} as ChartDataSets,
				{
					label: 'Sleep/day (7-day average)',
					data: convertToData(window.Tracker.rolling7DayAverages['Sleeping']),
					borderColor: 'rgba(3, 169, 244, 0.6)',
					borderWidth: 1,
					backgroundColor: 'transparent',
					pointRadius: 0
				} as ChartDataSets,
			]
		}
	}));

	new Chart(get2dCanvasContext('workGraph'), _.merge(_.cloneDeep(defaultChartOptions), {
		data: {
			datasets: [
				{
					label: 'Work/day',
					data: convertToData(window.Tracker.rolling1DayTotals['Work']),
					borderColor: 'rgba(244, 67, 54, 1.0)',
					borderWidth: 2,
					backgroundColor: 'transparent',
					pointRadius: 0
				} as ChartDataSets,
				{
					label: 'Work/day (7-day average)',
					data: convertToData(window.Tracker.rolling7DayAverages['Work']),
					borderColor: 'rgba(244, 67, 54, 0.6)',
					borderWidth: 1,
					backgroundColor: 'transparent',
					pointRadius: 0
				} as ChartDataSets,
			]
		}
	}));

});
