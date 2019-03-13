// Luo yhteys
var socket = io.connect("http://localhost:4000");
var input = document.getElementsByTagName("input")[0];



// Query DOM
var message = document.getElementById('message');
	handle = document.getElementById('handle');
	btn = document.getElementById('send');
	output = document.getElementById('output');
	chatWindow = document.getElementById("chat-window")


// Lähetys

function SendMessage(){
		/* tarkistaa viestin ja lähettää sen serverille*/
		if(message.value == "")
		{
			message.value = null;
		}

		else if (message.value < 1)
		{
			message.value = null;
		}
		else
		{
			socket.emit("chat",{
				message: message.value, 
				handle: handle.value
			})
		}

		//Clearaa text box viestin lähetyksen jälkeen
		document.getElementById("message").value = ""
}

message.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
	
	if(charCode == 13){
		SendMessage();
	}
}


//Listen for events
socket.on('chat', function(data){
	output.innerHTML += '<p><strong>' + data.handle +': </strong>' + data.message + '</p>'
	chatWindow.scrollTop = 10000;
	
});


