import 'source-map-support/register'; // enable sourcemaps in node
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';

import defaultConfig from './config/default';

let config = null;

switch(process.env.ENV) {
  default:
    config = defaultConfig;
    break;
}

// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;

soundworks.server.init(config);

soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    socketIO: config.socketIO,
    appName: config.appName,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

class Conductor extends soundworks.Experience {
  constructor() {
    super('conductor');

    this.sharedParams = this.require('shared-params');
    this.sharedParams.addText('numPlayers', 'num players', 0, ['conductor']);
    this.sharedParams.addNumber('organ-level', 'organ level', 0, 100, 1, 90);
    this.sharedParams.addTrigger('panic', 'panic');
    this.sharedParams.addTrigger('reload', 'reload', ['player']);
  }
}

class OrganExperience extends soundworks.Experience {
  constructor() {
    super('organ');
    this.sharedParams = this.require('shared-params');
  }
}

const conductor = new Conductor();
const playerExperience = new PlayerExperience(config.midiPortName);
const organExperience = new OrganExperience();

// start application
soundworks.server.start();
