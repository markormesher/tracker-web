import {Sequelize} from 'sequelize-typescript';
import Path = require('path');
import ConfigLoader = require('./config-loader');

const sequelize = new Sequelize({
	host: 'postgres',
	username: 'postgres',
	password: ConfigLoader.getSecret('postgres.password'),
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
