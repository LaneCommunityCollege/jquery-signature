$.fn.clearValidation = function(){var v = $(this).validate();$('[name]',this).each(function(){v.successList.push(this);v.showErrors();});v.resetForm();v.reset();};

function resizePic(){
  var h = $('tbody').height();
  $('#signature img').attr('height', h + "px").attr('width', h + "px");
  $('#signature img').parents('td').css('width', h + Math.floor(h/9) + "px");
}

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
  resizePic();
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
      $('#signature img').attr("src", "").removeAttr("height width");
      $('#signature img').css("display", "none");
    })

    $('input').on('keyup paste blur', function(){
      if($(this).valid() || $(this).val() == ""){
        var target = "." + this.id + ".field";
        
        //if we're adding text that wasn't previously there, or our new value is empty
        //resize the picture
        //TODO if we're working with a hidden field, this logic doesn't work.
        var resize = false;
        if($(this).val() != $(target).text() && !$(this).hasClass('notshown') && ($(target).text() == "" || $(this).val() == "")){
          resize = true;
        }
        $(target).text($(this).val());
        if(resize){
          resizePic();
        }

        if(this.id == "url"){
          if(this.value && $('.field.department a').length)
            $('.field.department a').attr('href', $(this).val());
          else if (this.value)
            $('.field.department').wrapInner("<a href='" + $(this).val() + "' style='color: #3a87bc; text-decoration: none; display: inline;'></a>");
          else
            $('.field.department > a').contents().unwrap();
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