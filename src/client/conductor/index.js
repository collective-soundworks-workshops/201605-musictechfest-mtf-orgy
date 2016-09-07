import * as soundworks from 'soundworks/client';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';

window.addEventListener('load', () => {
  const config = window.soundworksConfig;

  soundworks.client.init(config.clientType, config);
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  const conductor = new soundworks.BasicSharedController();
  conductor.setGuiOptions('numPlayers', { readOnly: true });

  soundworks.client.start();
});
