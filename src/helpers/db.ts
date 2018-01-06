import {Sequelize} from 'sequelize-typescript';
import Path = require('path');
import ConfigLoader = require('./config-loader');

const secrets = ConfigLoader.getSecrets();

const sequelize = new Sequelize({
	host: secrets.postgres.host,
	username: secrets.postgres.username,
	password: secrets.postgres.password,
	database: secrets.postgres.database,
	dialect: 'postgres',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	operatorsAliases: false,
	modelPaths: [Path.join(__dirname, '../models')],
	define: {
		//timestamps: true,
		//paranoid: true,
		//version: true
	},
	logging: () => {}
});

export = sequelize
