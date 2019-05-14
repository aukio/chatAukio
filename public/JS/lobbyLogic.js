
/* <------------ logic for opening tabs------------>*/
function openTab(evt, tabName) {
    var i, tableTab, tablinks;
    tableTab = document.getElementsByClassName("tableTab");
    for (i = 0; i < tableTab.length; i++) {
        tableTab[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
document.getElementById("chat-button").click();


var d = new Date();
var today = d.getDate() + "." + (+1 + +d.getMonth());

/* <-------add older messages from database--------> */
for (let i = 0; i < messages.length; i++) {
    var date = messages[i].date.slice(0, messages[i].date.length - 4).substr(6, 5);

    if (today.localeCompare(date) == -1) {
        var time = messages[i].date.substr(0, 5)
    }
    else {
        var time = date + " at " + messages[i].date.substr(0, 5)
    }
    output.innerHTML += "<p>" + time + "<strong onclick='AddUsernameToMessageField(event,0)' style='cursor: pointer;'>" + " " + messages[i].name + ': </strong>' + messages[i].message + '</p>'
    chatWindow.scrollTop = 10000;

}



/*<<-----------------adds badding to time to make the string always same lenght----------------------->> */
String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};


function getFormattedTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();

    hours = hours.toString().paddingLeft("00");
    minutes = minutes.toString().paddingLeft("00");

    return "{0}:{1}".format(hours, minutes);
};


function SearchForUsers() {
    var input, filter, list, button, a, i;
    input = document.getElementById("userSearch");
    filter = input.value.toUpperCase();
    list = document.getElementById("userList");
    button = list.getElementsByTagName("button");

    for (i = 0; i < button.length; i++) {
        if (button[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            button[i].style.display = "";
        } else {
            button[i].style.display = "none";
        }
    }
}


function AddUsernameToMessageField(evt,source) {
    if (source == 0) {
        var input = evt.currentTarget.innerHTML
        input = input.slice(0, input.length - 2)
        message.value = "/" + input.replace(/\s/g, '')+" ";
    }
    else{

        message.value = "/" + evt.currentTarget.innerHTML.replace(/\s/g, '')+" ";
    }
    document.getElementById("chat-button").click();
    document.getElementById("message").focus();
}

function AddUsersToList(connectedUsers) {
    document.getElementById("userList").innerHTML = "";
    for (let i = 0; i < connectedUsers.length; i++) {
    var btn = document.createElement("BUTTON");
    document.getElementById("userList").appendChild(btn);
    btn.innerHTML = connectedUsers[i].userName
    btn.onclick = function () {
        AddUsernameToMessageField(event,1);
    }
    }
  }