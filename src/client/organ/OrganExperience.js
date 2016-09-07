import * as soundworks from 'soundworks/client';
import PartialSynth from '../shared/PartialSynth';

const client = soundworks.client;
const audioContext = soundworks.audioContext;

const viewTemplate = `
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
    <p class="big">Organum</p>
    <p class="big"><%= numPlayers %></p>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

function decibelTolinear(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
export default class OrganExperience extends soundworks.Experience {
  constructor() {
    super('organ');

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.params = this.require('shared-params');
    this.playerSynths = new Map();

    this.gain = audioContext.createGain();
    this.gain.connect(audioContext.destination);
    this.gain.gain.value = 0.1;

    this.numPlayers = 0;
  }

  init() {
    this.viewTemplate = viewTemplate;
    this.viewContent = {
      numPlayers: 0,
    };
    this.view = this.createView();
  }

  start() {
    super.start(); // don't forget this

    if (!this.hasStarted)
      this.init();

    this.show();

    this.params.addParamListener('panic', () => this.panic());
    this.params.addParamListener('organ-level', (value) => {
      this.gain.gain.value = decibelTolinear(120 * (0.01 * value - 1));
    });

    this.receive('enable', (clientIndex, partialIndex, note) => {
      let synth = this.playerSynths.get(clientIndex);

      if(!synth) {
        synth = new PartialSynth(partialIndex, this.gain);
        this.playerSynths.set(clientIndex, synth);
      }

      this.viewContent.numPlayers = ++this.numPlayers;
      this.view.render();

      synth.note = note;
    });

    this.receive('disable', (clientIndex) => {
      const synth = this.playerSynths.get(clientIndex);

      if(synth) {
        synth.note = 0;

        this.viewContent.numPlayers = --this.numPlayers;
        this.view.render();
      }
    });

    this.receive('note', (clientIndex, note) => {
      const synth = this.playerSynths.get(clientIndex);

      if(synth)
        synth.note = note;
    });

    this.receive('control', (clientIndex, intensity, detune) => {
      const synth = this.playerSynths.get(clientIndex);

      if(synth) {
        synth.intensity = intensity;
        synth.detune = detune;
      }
    });
  }

  panic() {
    for(let synth of this.playerSynths.values())
      synth.note = 0;
  }
}
