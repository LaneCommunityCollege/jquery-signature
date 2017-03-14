$(function(){
	var form = $('form');

	$(document).ready(function(){
	  $('input').on('keyup paste', function(){
	  	if($(this).valid() || $(this).val() == ""){
	  		var target = "." + this.id + ".field";
	  		$(target).text($(this).val());

	  		if($('.field.email').text() && $('.field.phone').text() && !$('.mid').text()){
	  			$('.mid').text(" | ");
	  		}
	  		else {
	  			$('.mid').text("");
	  		}
	  	}
	  });
	});

	$.validator.addMethod("emailRegex", function(value, element, regexpr) {          
    return regexpr.test(value);
	}, "Be sure to use your Lane email address");

	$("form").validate({
		rules: {
			name: "required",
			email: {
				email: true,
				emailRegex: /[a-zA-Z]+@lanecc.edu/,
				required: false
			},
			phone: {
				phoneUS: true
			}
		}
	});
});