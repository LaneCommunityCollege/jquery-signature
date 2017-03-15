$.fn.clearValidation = function(){var v = $(this).validate();$('[name]',this).each(function(){v.successList.push(this);v.showErrors();});v.resetForm();v.reset();};

function previewPicture(){
  var preview = document.querySelector('#signature img');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    preview.src = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }

  $('#btn-txt').text('Picture added!');
  $('#signature img').parents('td').css('width', '70px');
  $('#signature img').css("display", "block");
}

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
    $('#reset').on('click', function(e){
      e.preventDefault();
      $('#picture').val("");
      $('#btn-txt').text('Add a picture');

      $('#signature img').parents('td').css('width', '0');
      $('#signature img').attr("src", "");
      $('#signature img').css("display", "none");
    })

    //ideally we should add blur here, so that when you select an existing answer and press tab
    //it works, but that has the side effect of running this multiple times, and wiping out the
    //pipe
    $('input').one('keyup paste', function(){
      if($(this).valid() || $(this).val() == ""){
        var target = "." + this.id + ".field";
        $(target).text($(this).val());

        if(this.id == "url"){
          $('.field.url').attr('href', $(this).val())
        }

        //if both email and phone are set, then add a pipe
        if(this.id == "email" || this.id == "phone"){
          console.log($('.field.email').text() + $('.field.phone').text() + !$('.mid').text())
          if($('.field.email').text() && $('.field.phone').text() && !$('.mid').text())
            $('.mid').text(" | ");
          else
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
      url: "Please enter a valid URL, starting with http://",
      phone: "Please specify a valid Phone Number, starting with the area code"
    }
  });
});