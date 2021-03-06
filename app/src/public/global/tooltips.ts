$(() => {
	$('[data-toggle="tooltip"]').tooltip();

	$('.block').hover(
			(event) => {
				const family = $(event.target).data('family');
				$('.block[data-family=\'' + family + '\']').addClass('highlight');
			},
			() => {
				$('.block').removeClass('highlight');
			}
	);
});
