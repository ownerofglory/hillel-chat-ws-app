'use strict';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const usernameInput = document.getElementById('usernameInput')
const connectButton = document.getElementById('connectButton')
const chatList = document.getElementById('chatList')
const messageInputArea = document.getElementById('messageInputArea')
const messageInputSection = document.getElementById('messageInputSection')
const sendMessageButton = document.getElementById('sendMessageButton')
const userConnectForm = document.getElementById('userConnectForm')
const disconnectButton = document.getElementById('disconnectButton')
const baseUrl = 'wss://tomcat.ownerofglory.com/hillel-chat-app/chat/'

let ws;
let username;

usernameInput.addEventListener('input', e => {
  const username = e.target.value

  if (username.length === 0) {
    connectButton.setAttribute('disabled', true)
  } else {
    connectButton.removeAttribute('disabled')
  }

})

const handleMessage = (message) => {
  console.log('Incoming message', message)

  const messageLine = document.createElement('div')
  messageLine.classList.add('row')

  const dateTime = new Date(message.dateTime)
  const formattedDateTime = dateTime.toLocaleString('ukr')

  if (message.service) {
    messageLine.classList.add('event-entry-line')

    messageLine.innerHTML = `
      <p class="event-entry">
        <span class="event-date">${formattedDateTime}</span>  <span class="username">${message.user}</span> ${message.content}
      </p>`
  } else {
    messageLine.classList.add('message-entry-line')

    messageLine.innerHTML = `
      <div class="${message.user == username ? 'own-message' : ''} card message">
        <div class="card-body message-body">
          <h5 class="card-title">${message.user}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">${formattedDateTime}</h6>
          <p class="card-text">${message.content}</p>
        </div>
      </div>`
  }
  
  chatList.insertBefore(messageLine, chatList.firstChild)
  // chatList.appendChild(messageLine)
}

const sendMessage = (content, socket) => {
  const message = {content: content}
  const data = JSON.stringify(message)
  socket.send(data)
}

const toggleVisibility = () => {
  if (ws) {
    chatList.style.visibility = 'visible'
    messageInputSection.style.visibility = 'visible'
    userConnectForm.style.display = 'none'
  } else {
    chatList.style.visibility = 'hidden'
    messageInputSection.style.visibility = 'hidden'
    userConnectForm.style.display = ''
  }
  
}

connectButton.onclick = (event) => {
  username = usernameInput.value
  ws = new WebSocket(`${baseUrl}${username}`)
  ws.onmessage = event => {
    const data = event.data
    const message = JSON.parse(data)
    handleMessage(message)

    toggleVisibility()
    usernameInput.value = ''
  }
}

disconnectButton.onclick = (event)  => {
  if (ws) {
    ws.close()
  }
  ws = undefined
  toggleVisibility()
}

sendMessageButton.onclick = e => {
  console.log(e)
  const content = messageInputArea.value
  if (ws) {
    sendMessage(content, ws)
    messageInputArea.value = ''
  }
}


