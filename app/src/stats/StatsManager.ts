import _ = require("lodash");
import Bluebird = require("bluebird");
import RedisHelper = require('../helpers/redis');
import {LogEntry} from "../models/LogEntry";

export class Stats {
	totalDuration: number;
	totalDurationPerActivity: { [key: string]: number };
	percentagePerActivity: { [key: string]: number };
	countAllDays: number;
	daysWithActivity: { [key: string]: string[] };
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

function computeTotalDurationPerActivity(entries: LogEntry[]): { [key: string]: number } {
	return _(entries)
			.groupBy(e => e.title)
			.map((groupedEntries, key) => {
				const objFragment: { [key: string]: number } = {};
				objFragment[key] = _.sumBy(groupedEntries, e => _.sumBy(e.periods, p => p.getDuration()));
				return objFragment;
			})
			.reduce(_.merge);
}

function computePercentagePerActivity(totalDurationPerActivity: { [key: string]: number }, totalDuration: number): { [key: string]: number } {
	return _(totalDurationPerActivity)
			.mapValues(val => val / totalDuration)
			.value();
}

function computeCountAllDays(totalDuration: number) {
	return Math.ceil(totalDuration / (24 * 60 * 60 * 1000));
}

function computeDaysWithActivity(entries: LogEntry[]): { [key: string]: string[] }  {
	return _(entries)
			.groupBy(e => e.title)
			.map((groupedEntries, key) => {
				const objFragment: { [key: string]: string[] } = {};
				objFragment[key] = _(groupedEntries)
						.flatMap(e => _.flatMap(e.periods, p => p.start.format('YYYY-MM-DD')))
						.uniq()
						.value();
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
				const percentagePerActivity = computePercentagePerActivity(totalDurationPerActivity, totalDuration);
				const countAllDays = computeCountAllDays(totalDuration);
				const daysWithActivity = computeDaysWithActivity(entries);

				return {
					totalDuration: totalDuration,
					totalDurationPerActivity: totalDurationPerActivity,
					percentagePerActivity: percentagePerActivity,
					countAllDays: countAllDays,
					daysWithActivity: daysWithActivity,
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
