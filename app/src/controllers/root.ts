import StatsManager = require("../stats/StatsManager");
import {NextFunction, Request, Response, Router} from 'express';
import {LogEntry} from "../models/LogEntry";
import Bluebird = require("bluebird");
import {Stats} from "../stats/StatsManager";

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	const getAllEntries = LogEntry.findAll({order: [['startTime', 'ASC']]});
	const getStats = StatsManager.getStats();

	Bluebird
			.all([getAllEntries, getStats])
			.then((results: [LogEntry[], Stats]) => {
				const entries = results[0];
				const stats = results[1];

				entries.forEach((entry, i) => {
					entry.startTimestamp = Math.floor(entry.startTime.getTime() / 1000);
					entry.endTimestamp = Math.floor(entry.endTime.getTime() / 1000);
					entry.duration = entry.endTimestamp - entry.startTimestamp;
					entries[i] = entry;
				});

				res.render('index', {
					entries: entries,
					totalDuration: stats.totalDuration,
					totalDurationPerActivity: stats.totalDurationPerActivity,
					percentagePerActivity: stats.percentagePerActivity,
					countAllDays: stats.countAllDays,
					countDaysWithExercise: stats.countDaysWithExercise,
				});
			})
			.catch(next);
});

export = router;
