const allColours = [ // for reference
	'#F44336',
	'#9C27B0',
	'#D67EE5',
	'#3F51B5',
	'#03A9F4',
	'#009688',
	'#8BC34A',
	'#FFEB3B',
	'#FF9800',
	'#795548',
	'#607D8B',
	'#424242',
	'#9E9E9E',
	'#E0E0E0',
];

const assignedColours: { [key: string]: string } = {
	'Downtime': '#E0E0E0',
	'Sleeping': '#03A9F4',

	'Exercise': '#9C27B0',
	'Personal development': '#8BC34A',
	'Personal projects': '#009688',

	'Commuting': '#3F51B5',
	'Work break': '#FFEB3B',
	'Work travel': '#FF9800',
	'Work': '#F44336',
};

const spareColours = [
	'#795548',
	'#607D8B',
	'#424242',
	'#9E9E9E',
	'#D67EE5',
];

$(() => {
	spareColours.sort(() => Math.random() - 0.5);
	$('.colourise').each((i, e) => {
		const elem = $(e);
		const key = elem.data('key');
		const colour = assignedColours[key] || spareColours.pop();
		assignedColours[key] = colour;
		if (elem.prop('tagName') === 'DIV') {
			elem.css({'background-color': colour})
		} else {
			elem.css({'color': colour})
		}
	});
});

