import Path = require('path');
import BodyParser = require('body-parser');
import Express  = require('express');
import {Request, Response, NextFunction} from 'express';
import NodeSassMiddleware = require('node-sass-middleware');
import ConfigLoader = require('./helpers/config-loader');
import SequelizeDb = require('./helpers/db');
import {StatusError} from './helpers/StatusError';

const app = Express();

// db connection
SequelizeDb.sync().then(() => {
	console.log('Database models synced successfully');
}).catch(err => {
	console.log('Failed to sync database models');
	console.log(err);
});

// form body content
app.use(BodyParser.raw());

// sass conversion
app.use(NodeSassMiddleware({
	src: Path.join(__dirname, '/assets/'),
	dest: Path.join(__dirname, '/public'),
	outputStyle: 'compressed'
}));

// controllers
app.use('/', require('./controllers/root'));
app.use('/data', require('./controllers/data'));

// views
app.set('views', Path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// static files
app.use(Express.static(Path.join(__dirname, 'public')));
app.use(Express.static(Path.join(__dirname, 'assets')));
[
	'bootstrap',
	'datatables.net',
	'datatables.net-bs',
	'font-awesome',
	'jquery'
].forEach(lib => {
	app.use(`/_npm/${lib}`, Express.static(Path.join(__dirname, `../node_modules/${lib}`)));
});

// error handlers
app.use((req: Request, res: Response, next: NextFunction) => {
	const err = new StatusError(`Could not find ${req.path}`);
	err.name = 'Not Found';
	err.status = 404;
	next(err);
});
app.use((error: StatusError, req: Request, res: Response, next: NextFunction) => {
	const status = error.status || 500;
	const name = error.name || error.message || 'Internal Server Error';
	let message = error.message || 'Internal Server Error';
	if (name === message) {
		message = undefined;
	}

	console.log(error);

	res.status(status).json({
		errorName: name,
		errorMessage: message,
		status: status,
	});
});

// go!
app.listen(3000, () => console.log('Listening on port 3000'));
