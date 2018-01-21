import {NextFunction, Request, Response, Router} from 'express';

import {LogEntry} from '../models/LogEntry';
import {getSecret} from "../helpers/config-loader";

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	LogEntry.findAll().then(entries => {
		res.json(entries);
	}).catch(next);
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
	if (req.header("Authorization") !== `Bearer ${getSecret('api.key')}`) {
		res.status(403).end();
		return
	}

	const body = <Buffer> req.body;
	const parsedBody = <any[]> JSON.parse(body.toString());
	LogEntry.destroy({truncate: true}).then(() => {
		LogEntry.bulkCreate(parsedBody).then(() => {
			res.status(200).end();
		}).catch(next);
	}).catch(next);
});

router.get('/env', (req: Request, res: Response, next: NextFunction) => {
	res.json(process.env);
});

export = router;
