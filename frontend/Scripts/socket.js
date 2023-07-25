import { WS_BASE_URL, DOMAIN_PATH } from './config.js';
import { fetchRoomId } from './api.js';

const room = await fetchRoomId();

const token = localStorage.getItem('token');
 
const socket = io(WS_BASE_URL, {
  path: DOMAIN_PATH
});

socket.on('connect', () => {    
  console.log('Connected to the server');
});

socket.on('message', (message) => {
  console.log('Message from server:', message);
});


socket.on('reload_tags', (data) => {
  console.log('Hi!');
  const userTags = data.userTags;
  const defaultTags = data.defaultTags;
  const textTags = data.textTags;
  localStorage.setItem('userTags', JSON.stringify(userTags));
  localStorage.setItem('defaultTags', JSON.stringify(defaultTags));
  localStorage.setItem('textTags', JSON.stringify(textTags));
});
