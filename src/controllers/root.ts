import {NextFunction, Request, Response, Router} from 'express';
import {LogEntry} from "../models/LogEntry";

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	LogEntry.findAll({order: [['startTime', 'ASC']]}).then(entries => {
		entries.forEach((entry, i) => {
			entry.startTimestamp = Math.floor(entry.startTime.getTime() / 1000);
			entry.endTimestamp = Math.floor(entry.endTime.getTime() / 1000);
			entry.duration = entry.endTimestamp - entry.startTimestamp;
			entries[i] = entry;
		});

		const totalPerActivity: { [key: string]: number } = {};
		let totalDuration = 0;
		entries.forEach(entry => {
			if (!totalPerActivity.hasOwnProperty(entry.title)) {
				totalPerActivity[entry.title] = 0;
			}
			totalPerActivity[entry.title] = totalPerActivity[entry.title] + entry.duration;
			totalDuration += entry.duration;
		});

		const percentagePerActivity: { [key: string]: number } = {};
		for (let key in totalPerActivity) {
			if (totalPerActivity.hasOwnProperty(key)) {
				percentagePerActivity[key] = totalPerActivity[key] / totalDuration;
			}
		}

		res.render('index', {
			entries: entries,
			totalPerActivity: totalPerActivity,
			percentagePerActivity: percentagePerActivity,
		});
	}).catch(next);
});

export = router;
