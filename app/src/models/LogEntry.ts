import Sequelize = require('sequelize');
import * as moment from 'moment';
import {Column, DataType, Model, Table} from "sequelize-typescript";

export class Period {

	constructor(start: moment.Moment, end: moment.Moment) {
		this.start = start;
		this.end = end;
	}

	start: moment.Moment;
	end: moment.Moment;

	getDuration = () => {
		return this.end.valueOf() - this.start.valueOf();
	}
}

function sameDay(a: moment.Moment, b: moment.Moment): boolean {
	return a.year() == b.year() && a.dayOfYear() == b.dayOfYear();
}

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
	private startTime: Date;

	@Column
	private endTime: Date;

	@Column
	note: string;

	periods: Period[];

	populatePeriods = (force: boolean = false) => {
		if (this.periods && this.periods.length > 0 && !force) {
			return;
		}

		const periods: Period[] = [];

		let start = moment(this.startTime);
		const end = moment(this.endTime);

		while (true) {
			// if the start and end fall on the same day, make one period and we are done
			if (sameDay(start, end)) {
				periods.push(new Period(start, end));
				break;
			}

			// otherwise, put the time chunk of the first day into a period and try again
			const startOfNextDay = start.clone().add(1, 'day').startOf('day');
			periods.push(new Period(start, startOfNextDay));
			start = startOfNextDay;
		}

		this.periods = periods;
	};

}
