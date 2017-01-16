var total = $('.question').length;
$('.count').html('0/'+total);

$('.question input').keyup(function(e){
	if(e.keyCode == 13)
	{	
		var action = $(this).siblings('a');
        // $(this).click().siblings()
        action.click();
    }
});

$('.question .next').click(function (e) {
	e.preventDefault();
	var index = $(this).parent().index();
	var nextQuestion = $(this).parent().next('.question');
	$(this).parent().removeClass('active');


	// 
	if(nextQuestion.length > 0){
		nextQuestion.addClass('active');
		nextQuestion.find('input').focus();
		getProgress(index);

	}
	else{
		console.log("no more questions");
		$('.progress .complete').css('width',"100%");
		$('.count').html(total+'/'+total);
		$('.questions .message').fadeIn();
		$('.questions .option').fadeOut();

	}
});


$('.question .back').click(function (e) {
	e.preventDefault();
	var index = $(this).parent().index();
	var nextQuestion = $(this).parent().next('.question');
	$(this).parent().removeClass('active');


	// 
	if(nextQuestion.length > 0){
		nextQuestion.addClass('active');
		nextQuestion.find('input').focus();
		getProgress(index);

	}
	else{
		console.log("no more questions");
		$('.progress .complete').css('width',"100%");
		$('.count').html(total+'/'+total);
		$('.questions .message').fadeIn();


	}
});



function getProgress(index){
	// var total = $('.question').length;
	console.log(index);
	var count = index+1;
	// var total1 = total+1;
	var w = ( count * (100/total));
	$('.count').html(count+'/'+total);

	$('.progress .complete').css('width',w+"%");
	// console.log('porcentaje:');
	// this.progress.style.width = this.current * ( 100 / this.questionsCount ) + '%';

	console.log()
}