$.fn.clearValidation = function(){var v = $(this).validate();$('[name]',this).each(function(){v.successList.push(this);v.showErrors();});v.resetForm();v.reset();};

function copyText(element) {
  var text = document.getElementById(element);
  var selection = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(text);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  //todo insert success message here
}

function insertInOrder(list, toInsert){
  var elementIndex = $(toInsert).data('index');
  var length = $(list).children().length;
  if(length == 0){
    $(list).append(toInsert);
    return;
  }
  var children = $(list).children();
  for(var i=0;i<length;i++){
    if($(children[i]).data('index') > elementIndex){
      $(children[i]).before(toInsert);
      return;
    }
  }
  $(list).append(toInsert);
  return;
}

$(function(){
  //wipe the form on refresh
  document.forms['siginfo'].reset();
  var form = $('form');

  $(document).ready(function(){
    $('.social-media input[type=checkbox]').on('click', function(){
      $currentField = $(this).parents('.input-group').find('input[type=text]');
      if($currentField.is(":visible")){
        $currentField.hide();
        $('#signature td.' + $currentField.attr('id')).remove();
      }
      else {
        $currentField.show();
        insertInOrder($('.social tr'), $('.hidden .' + $currentField.attr('id')).clone());
      }
    });

    $('.additions-group input[type=checkbox]').on('click', function(){
      $currentField = $(this).parents('.form-group').find('label');
      field = $currentField.attr('for');
      if($('.add.' + field).length){
        $('.add.' + field).remove();
      }
      else{
        //insertInOrder($('.additions'), )
        $saying = $("<p class='add " + field +"' style='margin-bottom:0' data-index='" + $currentField.data('index') + "'>" + $currentField.text() + "</p>");
        insertInOrder($('.additions'), $saying);
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

        if(this.id == 'name'){
          $(target).html($(this).val().replace(/(,.*)/g, '<span style="font-weight:normal;font-size:0.9em;">$1</span>'))
        }
        else{
          $(target).html($(this).val());
        }

        if(this.id == "url" || this.id == "department"){
          if($('#url').val() && $('.field.department a').length)
            $('.field.department a').attr('href', $('#url').val());
          else if ($('#url').val())
            $('.field.department').wrapInner("<a href='" + $('#url').val() + "' style='color: #0d40d9; text-decoration: none; display: inline;'></a>");
          else
            $('.field.department > a').contents().unwrap();
        }
        
        if($(this).parents('.social-media').length){
          $('#signature .' + $(this).attr('id')).attr('href', $(this).val());
          $('.hidden .' + $(this).attr('id')).attr('href', $(this).val());
        }

        //Set up the pipe between phone numbers
        if($('.field.phone').text() && $('.field.mobile').text() && $('.field.fax').text()){
          $('.mid, .mid2, .icon').show();
        }
        else if($('.field.phone').text() && $('.field.mobile').text()){
          $('.icon.fax, .mid2').hide();
          $('.icon.phone, .icon.mobile, .mid').show();
        }
        else if($('.field.phone').text() && $('.field.fax').text()){
          $('.icon.mobile, .mid2').hide();
          $('.icon.phone, .icon.fax, .mid').show();
        }
        else if($('.field.mobile').text() && $('.field.fax').text()){
          $('.icon.phone, .mid').hide();
          $('.icon.mobile, .icon.fax, .mid2').show();
        }
        else{
          $('.mid, .mid2, .icon').hide();
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