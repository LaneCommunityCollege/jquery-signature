$.fn.clearValidation = function(){var v = $(this).validate();$('[name]',this).each(function(){v.successList.push(this);v.showErrors();});v.resetForm();v.reset();};

function copyText(element) {
  var text = document.getElementById(element);
  var selection = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(text);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
}

$(function(){
  var form = $('form');

  $(document).ready(function(){
    $('input[type=checkbox]').on('click', function(){
      $currentField = $(this).parents('.input-group').find('input[type=text]');
      if($currentField.is(":visible")){
        $currentField.hide();
        $('#signature a.' + $currentField.attr('id')).remove();
      }
      else {
        $currentField.show();
        $('.social').append($('.hidden .' + $currentField.attr('id')).clone());
      }
    });

    $('input[type=text]').on('keyup paste blur', function(){
      if($(this).valid() || $(this).val() == ""){
        var target = "." + this.id + ".field";
        
        if($(this).val() == "" && !$(this).hasClass('notshown'))
          $(target).parents('span').hide();
        else
          $(target).parents('span').show();

        //if we're adding text that wasn't previously there, or our new value is empty
        //TODO if we're working with a hidden field, this logic doesn't work.
        var resize = false;
        if($(this).val() != $(target).text() && !$(this).hasClass('notshown') && ($(target).text() == "" || $(this).val() == "")){
          resize = true;
        }
        $(target).text($(this).val());

        if(this.id == "url"){
          if(this.value && $('.field.department a').length)
            $('.field.department a').attr('href', $(this).val());
          else if (this.value)
            $('.field.department').wrapInner("<a href='" + $(this).val() + "' style='color: #3a87bc; text-decoration: none; display: inline;'></a>");
          else
            $('.field.department > a').contents().unwrap();
        }
        else if($(this).parents('.social-media').length){
          $('#signature .' + $(this).attr('id')).attr('href', $(this).val());
          $('.hidden .' + $(this).attr('id')).attr('href', $(this).val());
        }

        //Set up the pipe between phone numbers
        if($('.field.phone').text() && $('.field.mobile').text() && $('.field.fax').text()){
          $('.mid, .mid2, .icon').show();
        }
        else if($('.field.phone').text() && $('.field.mobile').text()){
          $('.mid').show();
          $('.mid2').hide();
          $('.icon.phone, .icon.mobile').show();
        }
        else if($('.field.phone').text() && $('.field.fax').text()){
          $('.mid').show();
          $('.mid2').hide();
          $('.icon.phone, .icon.fax').show();
        }
        else if($('.field.mobile').text() && $('.field.fax').text()){
          $('.mid2').show();
          $('.mid').hide();
          $('.icon.mobile, .icon.fax').show();
        }
        else{
          $('.mid, mid2, .icon').hide();
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
      mobile: {
        phoneUS: true
      },
      fax: {
        phoneUS: true
      },
      url: {
        url: true
      }
    },
    messages: {
      url: "Please enter a valid URL, starting with http://",
      phone: "Please specify a valid Phone Number, starting with the area code"
    }
  });
});