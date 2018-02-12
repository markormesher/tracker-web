interface Window {
	Tracker: {
		rolling1DayTotals: { [key: string]: { [key: string]: number } },
		rolling7DayAverages: { [key: string]: { [key: string]: number } },
	};
}
