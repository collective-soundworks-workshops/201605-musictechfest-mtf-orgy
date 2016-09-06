import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

function decibelTolinear(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

function centTolinear(val) {
  return Math.exp(0.0005776226504666211 * val); // pow(2, val / 1200)
};

function midiToFrequency(val) {
  return 440 * Math.exp(0.05776226504666211 * (val - 69));
}

export default class PartialSynth {
  constructor(partialIndex, output = audioContext.destination) {
    this.notePitch = 0;
    this.partialIndex = partialIndex;
    this.output = output;

    this._osc = null;
    this._env = null;
    this._gain = 0;
    this._detune = 0;

    this.maxDetune = 20;
    this.fadeTime = 0.200;
    this.fadeInTime = 0.200;
    this.fadeOutTime = 0.400;
  }

  _startPartial(time, notePitch) {
    if(this._osc)
      this._stopPartial(time);

    const env = audioContext.createGain();
    env.connect(this.output);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(this._gain, time + this.fadeInTime);

    const osc = audioContext.createOscillator();
    osc.connect(env);
    osc.type = 'sine';
    osc.frequency.value = midiToFrequency(notePitch) * (this.partialIndex + 1);
    osc.detune.value = this._detune;
    osc.start(time);

    this._osc = osc;
    this._env = env;
  }

  _stopPartial(time) {
    if(this._osc) {
      const param = this._env.gain;
      const value = param.value;

      param.cancelScheduledValues(time);
      param.setValueAtTime(value, time);
      param.linearRampToValueAtTime(0, time + this.fadeOutTime);

      this._osc.stop(time + this.fadeOutTime);

      this._osc = null;
      this._env = null;
    }
  }

  _updateGain(time, gain) {
    if(this._env) {
      const param = this._env.gain;
      const value = param.value;

      param.cancelScheduledValues(time);
      param.setValueAtTime(value, time);
      param.linearRampToValueAtTime(gain, time + this.fadeTime);
    }

    this._gain = gain;
  }

  _updateDetune(time, detune) {
    if(this._osc) {
      const param = this._osc.detune;
      const value = param.value;

      param.cancelScheduledValues(time);
      param.setValueAtTime(value, time);
      param.linearRampToValueAtTime(detune, time + this.fadeTime);
    }

    this._detune = detune;
  }

  set intensity(value) {
    const time = audioContext.currentTime;
    const intensity = Math.max(0, Math.min(1, value));
    const gain = decibelTolinear((intensity - 1) * 80);
    this._updateGain(time, gain);
  }

  set detune(value) {
    const time = audioContext.currentTime;
    const detune = this.maxDetune * Math.max(-1, Math.min(1, value));
    this._updateDetune(time, detune);
  }

  set note(pitch) {
    if(pitch !== this.notePitch) {
      const time = audioContext.currentTime;

      if(pitch > 0)
        this._startPartial(time, pitch);
      else
        this._stopPartial(time, pitch);

      this.notePitch = pitch;
    }
  }
}
