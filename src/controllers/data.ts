import {NextFunction, Request, Response, Router} from 'express';

import {LogEntry} from '../models/LogEntry';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	LogEntry.findAll().then(entries => {
		res.json(entries);
	}).catch(next);
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
	const body = <Buffer> req.body;
	const parsedBody = <any[]> JSON.parse(body.toString());
	LogEntry.destroy({truncate: true}).then(() => {
		LogEntry.bulkCreate(parsedBody).then(() => {
			res.status(200).end();
		}).catch(next);
	}).catch(next);
});

export = router;
