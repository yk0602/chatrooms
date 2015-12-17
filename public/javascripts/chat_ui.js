function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElemet(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

//处理原始的用户输入
function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;
	if(message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if(systemMessage) {
			$('#messages').append(divSystemContentElemet(systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text, message);
		$('#messages').append(divSystemContentElemet(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
	$('#send-message').val('');
}

var socket = io.connect();
$(document).ready(function() {
	var chatApp = new Chat(socket);
	socket.on('nameResult', function(result) {
		var message;
		if(result.success) {
			message = 'You are now known as ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('messages').append(divSystemContentElemet(message));
	});
	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#message').append(divSystemContentElemet('Room changed.'));
	});
	
	socket.on('message', function(message) {
		var newElement = $('<div></div>').text(message.text);
		$('#message').append(newElement);
	});
	
	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		for(var room in rooms) {
			room = room.substring(1, room.length);
			if(room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		$('#room-list div').click(function() {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});
	
	setInterval(function() {
		socket.emit('rooms');
	}, 1000);
	$('#send-message').focus();
	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});
});