import * as soundworks from 'soundworks/client';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';
import OrganExperience from './OrganExperience';


window.addEventListener('load', () => {
  const config  = window.soundworksConfig;
  soundworks.client.init(config.clientType, config);
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  const experience = new OrganExperience();

  soundworks.client.start();
});
