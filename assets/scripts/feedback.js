$.Feedback = {
	init: function() { 	},
	
	onSaveFeedback: function(result) {
		if (result['code'] != true) {
			return $(document).crAlert(result['result']);
		}

		var $alert = $('<div class="alert alert-success"> <strong>' + _msg['Thanks for contacting us'] + ' </strong> </div>');
		$('#frmCommentEdit')
			.hide()
			.parent().append($alert);
			
		$alert.hide().fadeIn();
	}
};
