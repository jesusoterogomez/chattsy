var socket = io();
// var username = '';
var sessionid = '';
var user = '';
$(window).load(function() {

	$('.name').focus();

});

$(document).ready(function() {




function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return null;
  else
    return results[1];
}



$('#theme1').click(function (e) {
	e.preventDefault();
	$('.messages, #m').css('background','#fff');
	$('html').css('background','#D96050');
	// $('html').css('background','url(theme/geometry.png)');
$('.sidebar').css('background','#c65243');
});
$('#theme2').click(function (e) {
	e.preventDefault();
	$('.messages, #m').css('background','url(theme/subtle_dots.png)');
		$('html').css('background','url(theme/stardust.png)');
$('.sidebar').css('background','rgba(0,0,0,0.3)');

});


	var focused = true;

	var badge = 0;
	var favicon = new Favico({
		animation : 'pop',
		// position : 'up',
		bgColor : '#26A89E',
		textColor : '#fff'
	});

	function plusOne(){
		favicon.animation = 'pop';
		badge = badge + 1;
		favicon.badge(badge);
	}
	function minusOne(){
		badge = (badge-1 < 0) ? 0 : (badge - 1);
		favicon.badge(badge);
	}
	function resetFavicon(){
		// favicon.reset();
		badge = 0;
		favicon.badge(badge);
		favicon = new Favico({
		animation : 'pop',
		// position : 'up',
		bgColor : '#26A89E',
		textColor : '#fff'
	});
	}

    //intial value
    favicon.badge(badge);




    var timeChangeStatus;
    function clearTime(){
    	clearTimeout(timeChangeStatus);
    }
    $(window).blur(function() {
    	clearTimeout(timeChangeStatus);

    	if(user.logged == true){
    	focused = false;
		// console.log('left window');

		changeStatus('away');
	}

});

    $(window).focus(function() {
    	if(user.logged == true){
    		focused = true;
    	resetFavicon();

		// console.log('came back to window');
		changeStatus('online');

	}
});


    function changeStatus(status){
    	clearTimeout(timeChangeStatus);

    	if(status == 'away'){
    		timeChangeStatus = setTimeout(function() {
    			socket.emit('status change',{
    				uid: user.uid,
    				status: status
    			});
    		}, 20000);
    	}
    	else{
    		socket.emit('status change',{
    			uid: user.uid,
    			status: status
    		});
    	}
    }

    $('.sidebar li').click(function (e) {
    	e.preventDefault();
    	$('.sidebar li').removeClass('selected');
    	$(this).addClass('selected');
    });

    $('.quickControls span').click(function (e) {
    	e.preventDefault();
	// $('.sidebar li').removeClass('selected');
	$(this).toggleClass('active');
});



	// $('.login form').submit(function (e) {
	// 	e.preventDefault();
	// 	prepareChatWindow();
	// 	username = $('.name').val();

	// 	startChat();
	// });

$('.signup').click(function (e) {
	e.preventDefault();
	$('.login').fadeOut();
	$('.register').fadeIn();
});
$('.signin').click(function (e) {
	e.preventDefault();
	$('.register').fadeOut();
	$('.login').fadeIn();
});


$('.register .submit').click(function (e) {
	e.preventDefault();

	username = $('.register .name').val();
	var uid = $('.register .userid').val();
	var email = $('.register .email').val();
	var pw = $('.register .password').val();


	socket.emit('user register', {
		uid: uid,
		name: username,
		email: email,
		pw: pw
	});


	// startChat();


});

var interval
$('.login form').submit(function (e) {
	e.preventDefault();
	var dots = 0;
	interval = setInterval (type, 600);
	$('.login form button').html('');
	// $('.login form button').css('font-size','16pt');
	function type()
	{
		if(dots < 3)
		{
			$('.login form button').append('.');
			dots++;
		}
		else
		{
			$('.login form button').html('');
			dots = 0;
		}
	}

	var uid = $('.login .userid').val();
	var pw = $('.login .password').val();


	socket.emit('user login', {
		uid: uid,
		pw: pw

	});

});


socket.on('login result', function(data){
	// console.log(data);
	if(data.logged == true){
		user = data;

		socket.on('userlist update', function(data){
					// console.log(data);
					return false;
				});
		prepareChatWindow();
		startChat();
	}
	else{
		clearInterval(interval);
		$('.login form button').html('Try Again');
	}




	return false;

});




function prepareChatWindow(){
	$('.logo').addClass('logged');
	$('.login').fadeOut();
	$('.register').fadeOut();

	$('.chatwindow').fadeIn();
	$('.sidebar').fadeIn();
	$('#m').focus();
}




function socketConnect(){

	socket.on('connect', function() {
		var connid = socket.io.engine.id;
		sessionid = connid;
		// console.log('session: '+sessionid);
		socket.on('disconnect', function() {
	 // $('#'+sessionid).remove();
	 console.log("disconnected");
	 // alert("There's a new version of Chattsy, click OK to refresh");
	 console.log("server stopped");
	 location.reload();
	});
	});
}



function startChat(){
	// socket.emit('add user', username);


	$('.send').submit(function(e){
		e.preventDefault();
		var data = $('#m').val();
		socket.emit('chat message', {
			uid: user.uid,
			name: user.name,
			message: data
		});

	  	      // Tell the server your username

	  	      $('#m').val('');

	  	      return false;
	  	  });

	socket.on('userlist update', function(data){
		// console.log(data);
		for (var i = 0; i < data.list.length; i++) {
			if(data.list[i].uid != user.uid){
				if($("#"+data.list[i].uid).length == 0)
				{
					var s = data.list[i].status.charAt(0).toUpperCase() + data.list[i].status.substr(1).toLowerCase();
					$('.userlist ul').append($('<li id="'+data.list[i].uid+'"><h2>'+data.list[i].name+'</h2><h3 class="statustag"><span class="'+data.list[i].status+'">'+s+'</span></h3></li>'));
				}
			}
		};
	});


	socket.on('status change', function(data){
		// console.log(data);
		var s = data.status.charAt(0).toUpperCase() + data.status.substr(1).toLowerCase();
		$('.userlist #'+data.uid+' .statustag span').removeClass().addClass(data.status);
		$('.userlist #'+data.uid+' .statustag span').html(s);
		// for (var i = 0; i < data.list.length; i++) {
		// 	if(data.uid == user.uid){
		// 		if($("#"+data.list[i].uid).length == 0)
		// 		{
		// 			$('.userlist ul').append($('<li id="'+data.list[i].uid+'"><h2>'+data.list[i].name+'</h2><h3 class="statustag">'+data.list[i].status+'</h3></li>'));
		// 		}
		// 	}
		// };
	});


	socket.on('remove user',function(data){
		$('#'+data).fadeOut();
		setTimeout(function() {
			$('#'+data).remove();
		}, 1000);
	});



	socket.on('chat message', function(data){
		// console.log(data);
		var myNotification = new Notify(data.name, {
			icon: 'notification.png',
			timeout: 4,
			body: data.message,
			notifyShow: onNotifyShow
		});


		function onNotifyShow() {
			console.log('notification was shown!');
		}

		if(data.uid == user.uid){
			$('.messages ul').append($('<li class="me"><h2>'+data.name+' <h2><p data-linkify="this">'+data.message+'</p></li>'));
			scrollChat();
		}
		else{
			if(focused == false){
				plusOne();
			}
			$('.messages ul').append($('<li class="other"><h2>'+data.name+' <h2><p data-linkify="this">'+data.message+'</p></li>'));
			scrollChat();
			$.titleAlert("New Message - Chattsy", {
				requireBlur:true,
				stopOnFocus:true,
				// duration:3000,
				interval:500
			});
			if($('#notifications').hasClass('active')){
				myNotification.show();
				playAudio("notification.mp3");

			}


		}
		function checkURL(url) {
			return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
		}

		$('.messages p').linkify();
		var t = $('.messages p').last().find('a').first().attr('href');
		if(t !== undefined){
			if (checkURL(t)){
				$('.messages p').last().prepend('<br><img src="'+t+'"/><br>');
			}
		}


	});

$('.messages').on('click','p img', function (e) {
	e.preventDefault();
	$(this).toggleClass('thumb');
});

}

function scrollChat(){
	var scrollWindow    = $('.messages');
	var height = scrollWindow[0].scrollHeight;
	$(".messages").animate({ scrollTop: height},300);

}

function playAudio(src)
{
	if($('#sounds').hasClass('active')){
		var audioElement = document.createElement('audio');
		audioElement.setAttribute('src', src);
		audioElement.setAttribute('autoplay', 'autoplay');

		$.get();

		audioElement.addEventListener("load", function() {
			audioElement.play();
		}, true);

		audioElement.play();
	}
}
});