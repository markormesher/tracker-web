import Sequelize = require('sequelize');
import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table
export class LogEntry extends Model<LogEntry> {

	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: Sequelize.UUIDV4
	})
	id: string;

	@Column
	title: string;

	@Column
	startTime: Date;

	@Column
	endTime: Date;

	@Column
	note: string;

	startTimestamp: number;
	endTimestamp: number;
	duration: number;

}
