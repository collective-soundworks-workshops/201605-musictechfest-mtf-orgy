import * as soundworks from 'soundworks/client';
import PlayerRenderer from './PlayerRenderer';
import PartialSynth from '../PartialSynth';

const client = soundworks.client;
const audioContext = soundworks.audioContext;

const viewTemplate = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
      <p class="big"><%= title %></p>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
export default class PlayerExperience extends soundworks.Experience {
  constructor(audioFiles) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.params = this.require('shared-params');
    this.checkin = this.require('checkin', { showDialog: false });
    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });

    this.throttle = 4;
    this.throttleCount = 0;
    this.pitchMean = 0;
    this.rollMean = 0;

    this.note = 0;
  }

  init() {
    // initialize the view
    this.viewTemplate = viewTemplate;
    this.viewContent = { title: `Tilt it!` };
    this.viewCtor = soundworks.CanvasView;
    this.view = this.createView();
  }

  start() {
    super.start(); // don't forget this

    if (!this.hasStarted)
      this.init();

    this.show();

    // initialize rendering
    this.renderer = new PlayerRenderer();
    this.view.addRenderer(this.renderer);
    this.view.setPreRender((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.width, ctx.height);
    });

    this.params.addParamListener('panic', () => this.panic());
    this.params.addParamListener('reload', () => this.reload());

    this.receive('enable', (partialIndex, note) => {
      const synth = new PartialSynth(partialIndex);
      synth.note = note;
      this.synth = synth;
      this.note = note;
    });

    this.receive('note', (note) => {
      if(this.synth) {
        this.synth.note = note;
        this.note = note;
      }
    });

    this.motionInput.addListener('accelerationIncludingGravity', (data) => {
      const accX = data[0];
      const accY = data[1];
      const accZ = data[2];

      const pitch = 2 * Math.atan(accY / Math.sqrt(accZ * accZ + accX * accX)) / Math.PI;
      const roll = -2 * Math.atan(accX / Math.sqrt(accY * accY + accZ * accZ)) / Math.PI;

      this.pitchMean += pitch;
      this.rollMean += roll;
      this.throttleCount++;

      if(this.throttleCount === this.throttle) {
        const pitchMean = this.pitchMean / this.throttle;
        const rollMean = this.rollMean / this.throttle;
        const intensity = (Math.min(0.5, Math.max(-0.5, pitchMean)) + 0.5);
        const detune = 2 * Math.min(0.5, Math.max(-0.5, rollMean));

        this.send('control', intensity, detune);
        this.synth.intensity = intensity;
        this.synth.detune = detune;

        if(this.note > 0)
          this.renderer.intensity = intensity;
        else
          this.renderer.intensity = 0;

        this.pitchMean = 0;
        this.rollMean = 0;
        this.throttleCount = 0;
      }
    });
  }

  panic() {
    if(this.synth) {
      this.synth.note = 0;
      this.note = 0;
    }
  }

  reload() {
    window.location.reload();
  }
}
