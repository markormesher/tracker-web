const colours = [ // some are already assigned below
	//'#F44336',
	'#E91E63',
	'#9C27B0',
	//'#673AB7',
	'#3F51B5',
	'#2196F3',
	'#03A9F4',
	//'#00BCD4',
	'#009688',
	//'#4CAF50',
	'#8BC34A',
	'#CDDC39',
	//'#FFEB3B',
	'#FFC107',
	//'#FF9800',
	'#FF5722'
];

const assignedColours: { [key: string]: string } = {
	'Downtime': '#00BCD4',
	'Sleeping': '#FFEB3B',
	'Personal projects': '#4CAF50',
	'Work': '#F44336',
	'Exercise': '#673AB7',
	'Personal development': '#FF9800'
};

$(() => {
	const randomColours = colours.slice().sort(() => Math.random() - 0.5);
	$('.colourise').each((i, e) => {
		const elem = $(e);
		const key = elem.data('key');
		const colour = assignedColours[key] || randomColours.pop();
		assignedColours[key] = colour;
		elem.css({'background-color': colour})
	});
});

