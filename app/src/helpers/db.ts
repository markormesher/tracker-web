import {Sequelize} from 'sequelize-typescript';
import Path = require('path');
import ConfigLoader = require('./config-loader');

const secrets = ConfigLoader.getSecrets();

const sequelize = new Sequelize({
	host: 'tracker-web-postgres',
	username: 'postgres',
	password: null,
	database: 'postgres',
	dialect: 'postgres',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	operatorsAliases: false,
	modelPaths: [Path.join(__dirname, '../models')],
	logging: () => {}
});

export = sequelize
