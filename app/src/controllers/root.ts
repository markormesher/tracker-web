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

				entries.forEach((e, i) => {
					e.populatePeriods();
					entries[i] = e;
				});

				res.render('index', {
					entries: entries,
					totalDuration: stats.totalDuration,
					totalDays: stats.totalDays,
					totalDurationPerActivity: stats.totalDurationPerActivity,
					percentageDurationPerActivity: stats.percentageDurationPerActivity,
					daysWithActivity: stats.daysWithActivity,
				});
			})
			.catch(next);
});

export = router;
