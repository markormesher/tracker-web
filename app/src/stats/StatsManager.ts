import _ = require("lodash");
import Bluebird = require("bluebird");
import RedisHelper = require('../helpers/redis');
import {LogEntry} from "../models/LogEntry";

export class Stats {
	totalDuration: number;
	totalDurationPerActivity: { [key: string]: number };
	percentagePerActivity: { [key: string]: number };
	countAllDays: number;
	countDaysWithExercise: number;
}

function computeTotalDuration(entries: LogEntry[]): number {
	if (entries.length == 0) {
		return 0;
	} else if (entries.length == 1) {
		return entries[0].duration;
	} else {
		return entries[entries.length - 1].endTimestamp - entries[0].startTimestamp;
	}
}

function computeTotalDurationPerActivity(entries: LogEntry[]): { [key: string]: number } {
	return _(entries)
			.groupBy(e => e.title)
			.map((groupedEntries, key) => {
				const objFragment: { [key: string]: number } = {};
				objFragment[key] = _.sumBy(groupedEntries, e => e.duration);
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
	return Math.ceil(totalDuration / (24 * 60 * 60));
}

function computeCountDaysWithActivity(entries: LogEntry[], activity: string): number {
	return _(entries)
			.filter(e => e.title === activity)
			.map(e => e.startTime.toISOString().substr(0, 10))
			.uniq()
			.value()
			.length;
}

function recomputeStats(): Bluebird<'OK'> {
	return LogEntry
			.findAll({order: [['startTime', 'ASC']]})
			.then(entries => {
				entries.forEach((entry, i) => {
					entry.startTimestamp = Math.floor(entry.startTime.getTime() / 1000);
					entry.endTimestamp = Math.floor(entry.endTime.getTime() / 1000);
					entry.duration = entry.endTimestamp - entry.startTimestamp;
					entries[i] = entry;
				});

				const totalDuration = computeTotalDuration(entries);
				const totalDurationPerActivity = computeTotalDurationPerActivity(entries);
				const percentagePerActivity = computePercentagePerActivity(totalDurationPerActivity, totalDuration);
				const countAllDays = computeCountAllDays(totalDuration);
				const countDaysWithExercise = computeCountDaysWithActivity(entries, 'Exercise');

				return {
					totalDuration: totalDuration,
					totalDurationPerActivity: totalDurationPerActivity,
					percentagePerActivity: percentagePerActivity,
					countAllDays: countAllDays,
					countDaysWithExercise: countDaysWithExercise,
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
