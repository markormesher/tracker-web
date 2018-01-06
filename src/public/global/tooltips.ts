$(() => {
	$('[data-toggle="tooltip"]').tooltip();

	$('.block').hover(
			(event) => {
				const family = $(event.target).data('family');
				console.log(family);
				$('.block[data-family=\'' + family + '\']').addClass('highlight');
			},
			() => {
				$('.block').removeClass('highlight');
			}
	)
});
