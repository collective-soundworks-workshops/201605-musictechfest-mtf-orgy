// import client side soundworks and player experience
import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience.js';

const files = [
  '/sounds/sound-welcome.mp3',
  '/sounds/sound-others.mp3'
];

window.addEventListener('load', () => {
  const { appName, clientType, socketIO }  = window.soundworksConfig;

  soundworks.client.init(clientType, { socketIO, appName });

  const experience = new PlayerExperience(files);

  soundworks.client.start();
});
