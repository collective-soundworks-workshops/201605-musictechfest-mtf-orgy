import * as soundworks from 'soundworks/client';
const client = soundworks.client;

window.addEventListener('load', () => {
  const { appName, clientType, socketIO }  = window.soundworksConfig;

  soundworks.client.init(clientType, { socketIO, appName });

  const conductor = new soundworks.Conductor();
  conductor.setGuiOptions('numPlayers', { readOnly: true });

  client.start();
});
