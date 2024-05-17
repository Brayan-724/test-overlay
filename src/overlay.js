// import { appWindow } from '@tauri-apps/api/window';
// // await appWindow.setIgnoreCursorEvents(false);
import './assets/style.scss'
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Crear una matriz de posiciones predefinida
  let positions = [];
  for (let x = 8; x <= 88; x += 4) {
    for (let y = 8; y <= 88; y += 4) {
        positions.push({ x, y });
    }
  }
  
  // Barajar el array de posiciones
  positions = shuffleArray(positions);
  
  // Índice de posición actual
  let currentPositionIndex = 0;
  
  // Función para obtener la siguiente posición de la matriz
  function getNextPosition() {
    const position = positions[currentPositionIndex];
    currentPositionIndex = (currentPositionIndex + 1) % positions.length; // Avanzar al siguiente índice circularmente
    return position;
  }
  var app = document.querySelector('#app');
  const urlParams = new URLSearchParams(window.location.search);
  
  document.querySelector('#stream').value = localStorage.getItem("stream");
  if(urlParams.get("stream") != null) localStorage.setItem('stream', urlParams.get("stream"));
  
  document.querySelector('#maxmessages').value = localStorage.getItem("maxmessages");
  if(urlParams.get("maxmessages") != null) localStorage.setItem('maxmessages', urlParams.get("maxmessages"));
  
  
  if(urlParams.get("stream") != null && urlParams.get("stream") != "" && urlParams.get("maxmessages") != null){
    document.querySelector('#prompt').remove();
  }
  
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true
    },
    channels: [urlParams.get('stream')],
  });
  
  client.connect();
  
  var gz = 0;
  
  client.on("clearchat", (channel) => {
    app.innerHTML =""
  });
  
  client.on("messagedeleted", (channel, username, deletedMessage, userstate) => {
    document.getElementById(`message=${userstate['target-msg-id']}`).remove();
  });
  
  function getMessageHTML(message, { emotes }) {
    if (!emotes) return message;
  
    // store all emote keywords
    // ! you have to first scan through 
    // the message string and replace later
    const stringReplacements = [];
  
    // iterate of emotes to access ids and positions
    Object.entries(emotes).forEach(([id, positions]) => {
      // use only the first position to find out the emote key word
      const position = positions[0];
      const [start, end] = position.split("-");
      const stringToReplace = message.substring(
        parseInt(start, 10),
        parseInt(end, 10) + 1
      );
  
      stringReplacements.push({
        stringToReplace: stringToReplace,
        replacement: `<img src='https://static-cdn.jtvnw.net/emoticons/v2/${id}/animated/dark/1.0' onerror="this.src=src='https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0'">`,
      });
    });
  
    // generate HTML and replace all emote keywords with image elements
    const messageHTML = stringReplacements.reduce(
      (acc, { stringToReplace, replacement }) => {
        // obs browser doesn't seam to know about replaceAll
        return acc.split(stringToReplace).join(replacement);
      },
      message
    );
  
    return messageHTML;
  }
  
  client.on('message', (channel, tags, message, self) => {
    // console.log(tags);
  // console.log(`Message img ${getMessageHTML(message, tags)}`);
  // console.log(`${tags['display-name']}: ${message}`);
  createMessageWindow(tags, message);
  
  });
  
  function createMessageWindow(tags, message) {
  const messageWindow = document.createElement('div');
  messageWindow.classList.add("window");
  messageWindow.id = `message=${tags['id']}`;
  
  const html = `
    <div class="title-bar">
      <div class="title-bar-text">${tags['display-name']}</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body">
      <p>${getMessageHTML(message, tags)}</p>
    </div>
  `;
  
  messageWindow.innerHTML = html;
  
  const closeButton = messageWindow.querySelector('.title-bar-controls button[aria-label="Close"]');
  closeButton.onclick = function(event){
    messageWindow.remove();
  };
  
  const titleBar = messageWindow.querySelector('.title-bar'); // Seleccionar la barra de título
  var div = app.appendChild(messageWindow);
  let isDragging = false;
  let initialX;
  let initialY;
  
  titleBar.addEventListener('mousedown', (event) => {
    isDragging = true;
    initialX = event.clientX - div.getBoundingClientRect().left;
    initialY = event.clientY - div.getBoundingClientRect().top;
    div.style.zIndex = gz;
    gz = gz + 1;
  });
  
  titleBar.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  titleBar.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  
  titleBar.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const newX = event.clientX - initialX;
      const newY = event.clientY - initialY;
  
      div.style.left = `${newX}px`;
      div.style.top = `${newY}px`;
    }
  });
  
  const { x, y } = getNextPosition(); // Obtener la siguiente posición de la matriz
  div.style.right = `${x}%`; // Cambiar a píxeles en lugar de porcentaje
  div.style.top = `${y}%`; // Cambiar a píxeles en lugar de porcentaje
  div.classList.add("window");
  div.style.zIndex = gz;
  
  div.onclick = function(event) {
    console.log(event);
    div.style.zIndex = gz;
    gz = gz + 1;
  }
  
  gz = gz + 1;
  
  if (app.children.length > urlParams.get("maxmessages")) {
    app.children[0].remove();
  }
  return messageWindow;
  }