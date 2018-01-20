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

		// basic stats
		const totalDuration = entries[entries.length - 1].endTimestamp - entries[0].startTimestamp;
		const numDays = Math.ceil(totalDuration / (24 * 60 * 60));

		// various metrics to collect
		const totalDurationPerActivity: { [key: string]: number } = {};
		const daysWithExercise = new Set<String>();

		entries.forEach(entry => {
			// total duration per activity
			if (!totalDurationPerActivity.hasOwnProperty(entry.title)) {
				totalDurationPerActivity[entry.title] = 0;
			}
			totalDurationPerActivity[entry.title] = totalDurationPerActivity[entry.title] + entry.duration;

			// days with exercise
			if (entry.title === "Exercise") {
				daysWithExercise.add(entry.startTime.toISOString().substr(0, 10))
			}
		});

		const percentagePerActivity: { [key: string]: number } = {};
		for (let key in totalDurationPerActivity) {
			if (totalDurationPerActivity.hasOwnProperty(key)) {
				percentagePerActivity[key] = totalDurationPerActivity[key] / totalDuration;
			}
		}

		res.render('index', {
			entries: entries,
			totalDuration: totalDuration,
			numDays: numDays,
			totalDurationPerActivity: totalDurationPerActivity,
			percentagePerActivity: percentagePerActivity,
			daysWithExercise: Array.from(daysWithExercise),
		});
	}).catch(next);
});

export = router;
