$.fn.clearValidation = function(){var v = $(this).validate();$('[name]',this).each(function(){v.successList.push(this);v.showErrors();});v.resetForm();v.reset();};

$(function(){
	var form = $('form');

	$(document).ready(function(){
	  $('input').on('keyup paste', function(){
	  	if($(this).valid() || $(this).val() == ""){
	  		var target = "." + this.id + ".field";
	  		$(target).text($(this).val());

	  		if(this.id == "url"){
	  			$('.field.url').attr('href', $(this).val())
	  		}

	  		//if both email and phone are set, then add a pipe
	  		if($('.field.email').text() && $('.field.phone').text() && !$('.mid').text()){
	  			$('.mid').text(" | ");
	  		}
	  		else {
	  			$('.mid').text("");
	  		}

	  		if($(this).val() == ""){
	  			$(this).clearValidation();
	  		}
	  	}
	  });
	});

	$.validator.addMethod("emailRegex", function(value, element, regexpr) { 
	   if(value.length > 0)         
    	return regexpr.test(value);
     return true;
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
			},
			url: {
				url: true
			}
		},
		messages: {
			url: "Please enter a valid URL, starting with http://"
		}
	});
});