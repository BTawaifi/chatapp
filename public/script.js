const socket = io();
const messageContainer = document.querySelector('#message-container')
const messageForm = document.getElementById('sent-container')
const messageInput = document.getElementById('message-input')
const onlineUsersNum = document.getElementById('online-Users')
const loginForm = document.getElementById('loginForm');
const formUserName = document.getElementById('formUserName');
const formRoomName = document.getElementById('formRoomName');
const getRoom = document.getElementById('getRoom');

var audio = new Audio("swiftly-610.mp3");

let onlineUsers = [];

let username = "";
let room = "";

var options = {
    'show': true,
    'focus': true
}
$('#staticBackdrop').modal(options)
//main loop after submit
$('#loginBtn').click((e) => {
    username = formUserName.value;
    room = formRoomName.value;
    if (username == null || username == "") {
        username = 'Anon ' + Math.floor(Math.random() * 1001)
    }
    getRoom.innerText = room
    socket.emit('joinRoom', { username, room });


    const docTitle = document.title;
    let notificationCount = 0;

    socket.on('chat-message', data => {
        if (data.name != '' && data.name != null && data.name != undefined) {
            appendMessage(`${data.name}: ${data.message}`)
            $(messageContainer).scrollTop(2000);
            audio.play();

            if (!document.hasFocus()) {
                notificationCount++;
                document.title = docTitle + ' (' + notificationCount + ')'
            }
            else {
                notificationCount = 0;
                document.title = docTitle;
            }

        }

    })
    socket.on('user-connected', name => {
        appendMessage(name + " connected")
    })
    socket.on('user-disconnected', name => {
        if (name != '' && name != null && name != undefined) {
            appendMessage(name + " disconnected")
        }
    })
    //https://socket.io/docs/client-connection-lifecycle/
    socket.on('disconnect', () => {
        //temp
        appendMessage('Connection Error...', 'red');
    })
    socket.on('reconnect', () => {
        messageContainer.lastChild.remove();
        socket.emit('joinRoom', { username, room })//temp
    })

    socket.on('users-online', Users => {
        onlineUsers = Users;
        /// let fndName = Object.values(onlineUsers).findIndex(e => e == name);
        //let names = Object.values(onlineUsers);//Array
        //names[fndName] = names[fndName] + '(You)';
        let text = ``;
        Users.forEach(e => text += e.username + ' | ');
        var ntext = text.replace(username, username + ' (You)')
        if (onlineUsers[1] == null) {
            ntext = username + ' (You)'
        }
        onlineUsersNum.innerText = ntext;

    })

    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        handleDefaultFormSubmit();
    })

    function appendMessage(message, color = 'black') {
        const messageElement = document.createElement('div');
        messageElement.innerText = message;
        if (color == 'self') {
            messageElement.style.color = '#0275d8';
        }
        else {
            messageElement.style.color = color;
        }
        messageContainer.append(messageElement)
    }


    function handleDefaultFormSubmit() {
        const message = messageInput.value;
        appendMessage(`${message}`, 'self')
        socket.emit('send-chat-message', message)
        messageInput.value = '';
        $(messageContainer).scrollTop(2000);
    }


    //handle enter key on form
    $('#message-input').keypress(function (e) {
        if (e.keyCode == 13 && !e.ctrlKey) {
            e.preventDefault();
            $("#sent-container").submit(function (e) {
                return false;
            });
            handleDefaultFormSubmit();
        }
    });
}
);
