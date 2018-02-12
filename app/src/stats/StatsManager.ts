import _ = require("lodash");
import Bluebird = require("bluebird");
import RedisHelper = require('../helpers/redis');
import * as moment from "moment";
import {LogEntry, Period} from "../models/LogEntry";

export class Stats {
	totalDuration: number;
	totalDurationPerActivity: { [key: string]: number };
	totalDurationPerActivityPerDay: { [key: string]: { [key: string]: number } };
	percentageDurationPerActivity: { [key: string]: number };
	countDays: number;
	countDaysPerActivity: { [key: string]: number };
	rolling1DayTotals: { [key: string]: { [key: string]: number } };
	rolling7DayAverages: { [key: string]: { [key: string]: number } };
}

function computeTotalDuration(entries: LogEntry[]): number {
	if (entries.length == 0) {
		return 0;
	} else {
		const firstEntry = entries[0];
		const lastEntry = entries[entries.length - 1];
		const firstPeriod = firstEntry.periods[0];
		const lastPeriod = lastEntry.periods[lastEntry.periods.length - 1];

		return lastPeriod.end.valueOf() - firstPeriod.start.valueOf();
	}
}

function computeCountDays(totalDuration: number) {
	return Math.ceil(totalDuration / (24 * 60 * 60 * 1000));
}

function computeTotalDurationPerActivity(entries: LogEntry[]): { [key: string]: number } {
	return _(entries)
			.groupBy(e => e.title)
			.map((groupedEntries: LogEntry[], entryKey: string) => {
				const objFragment: { [key: string]: number } = {};
				objFragment[entryKey] = _.sumBy(groupedEntries, e => _.sumBy(e.periods, p => p.getDuration()));
				return objFragment;
			})
			.reduce(_.merge);
}

function computeTotalDurationPerActivityPerDay(entries: LogEntry[]): { [key: string]: { [key: string]: number } } {
	return _(entries)
			.groupBy(e => e.title)
			.map((groupedEntries: LogEntry[], entryKey: string) => {
				const objFragment: { [key: string]: { [key: string]: number } } = {};
				objFragment[entryKey] = _(groupedEntries)
						.flatMap((e: LogEntry) => e.periods)
						.flatten()
						.groupBy((p: Period) => p.start.format("YYYY-MM-DD"))
						.map((groupedPeriods: Period[], periodKey: string) => {
							const innerObjFragment: { [key: string]: number } = {};
							innerObjFragment[periodKey] = _.sumBy(groupedPeriods, p => p.getDuration());
							return innerObjFragment;
						})
						.reduce(_.merge);
				return objFragment;
			})
			.reduce(_.merge);
}

function computePercentageDurationPerActivity(totalDurationPerActivity: { [key: string]: number }, totalDuration: number): { [key: string]: number } {
	return _(totalDurationPerActivity)
			.mapValues(val => val / totalDuration)
			.value();
}

function computeCountDaysPerActivity(totalDurationPerActivityPerDay: { [key: string]: { [key: string]: number } }): { [key: string]: number } {
	return _(totalDurationPerActivityPerDay)
			.mapValues((totalsPerDay: { [key: string]: number }) => {
				return _.keys(totalsPerDay).length;
			})
			.value();
}

function computeRollingAverage(activity: string, window: number, totalDurationPerActivityPerDay: { [key: string]: { [key: string]: number } }): { [key: string]: number } {

	const totalDurationPerDay = totalDurationPerActivityPerDay[activity];
	const firstDay = moment(_(totalDurationPerDay).keys().min());
	const lastDay = moment(_(totalDurationPerDay).keys().max());

	const output: { [key: string]: number } = {};

	let currentDate = firstDay;
	let windowValues: number[] = [];
	let sumSoFar = 0;
	while (currentDate.isSameOrBefore(lastDay)) {
		if (windowValues.length == window) {
			sumSoFar -= windowValues[0];
			windowValues = windowValues.slice(1);
		}

		const dateStr = currentDate.format("YYYY-MM-DD");
		const dayValue = totalDurationPerDay[dateStr] || 0;
		sumSoFar += dayValue;
		windowValues.push(dayValue);

		output[dateStr] = sumSoFar / windowValues.length;

		currentDate.add(1, 'day');
	}

	return output;
}

function computeRollingAverages(window: number, totalDurationPerActivityPerDay: { [key: string]: { [key: string]: number } }): { [key: string]: { [key: string]: number }} {
	return _(totalDurationPerActivityPerDay)
			.keys()
			.map(key => {
				const objFragment: { [key: string]: { [key: string]: number}} = {};
				objFragment[key] = computeRollingAverage(key, window, totalDurationPerActivityPerDay);
				return objFragment;
			})
			.reduce(_.merge);
}

function recomputeStats(): Bluebird<'OK'> {
	return LogEntry
			.findAll({order: [['startTime', 'ASC']]})
			.then(entries => {
				entries.forEach(e => e.populatePeriods());

				const totalDuration = computeTotalDuration(entries);
				const totalDurationPerActivity = computeTotalDurationPerActivity(entries);
				const totalDurationPerActivityPerDay = computeTotalDurationPerActivityPerDay(entries);
				const percentageDurationPerActivity = computePercentageDurationPerActivity(totalDurationPerActivity, totalDuration);
				const countDays = computeCountDays(totalDuration);
				const countDaysPerActivity = computeCountDaysPerActivity(totalDurationPerActivityPerDay);
				const rolling1DayTotals = computeRollingAverages(1, totalDurationPerActivityPerDay);
				const rolling7DayAverages = computeRollingAverages(7, totalDurationPerActivityPerDay);

				return {
					totalDuration: totalDuration,
					totalDurationPerActivity: totalDurationPerActivity,
					totalDurationPerActivityPerDay: totalDurationPerActivityPerDay,
					percentageDurationPerActivity: percentageDurationPerActivity,
					countDays: countDays,
					countDaysPerActivity: countDaysPerActivity,
					rolling1DayTotals: rolling1DayTotals,
					rolling7DayAverages: rolling7DayAverages,
				} as Stats;
			})
			.then(results => {
				const client = RedisHelper.getClient();
				return client
						.setAsync('stats.blob', JSON.stringify(results))
						.then(() => client.quitAsync());
			});
}

function getStats(secondAttempt: boolean = false): Bluebird<Stats> {
	const client = RedisHelper.getClient();
	return client.getAsync('stats.blob')
			.then((value: string) => {
				if (!value) {
					if (secondAttempt) {
						throw new Error('Stats could not be computed!');
					} else {
						return recomputeStats().then(() => getStats(true));
					}
				} else {
					return JSON.parse(value) as Stats;
				}
			})
			.then((value: Stats) => client.quitAsync().then(() => value));
}

export {
	recomputeStats,
	getStats
}
