import { Experience } from 'soundworks/server';
import * as midi from 'midi';

const numVoices = 3;
const numPartials = 8;

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(midiPortName) {
    super('player');

    this.params = this.require('shared-params');
    this.checkin = this.require('checkin');

    this.voices = [];
    this.activeVoices = [];
    this.inactiveVoices = [];
    this.voicesOfNotes = new Map();

    for (let i = 0; i < numVoices; i++) {
      const voice = {
        index: i,
        players: new Set(),
        note: 0,
      };

      this.voices.push(voice);
      this.inactiveVoices.push(voice);
    }

    const input = new midi.input();
    const portCount = input.getPortCount();
    let portName = '';
    let portIndex = -1;

    for (let i = 0; i < portCount; i++) {
      const str = input.getPortName(i);
      // console.log('MIDI port', i.toString() + ':', str);

      if (str.indexOf(midiPortName) >= 0) {
        portName = str;
        portIndex = i;
        break;
      }
    }

    if (portIndex >= 0) {
      console.log(`> Opening MIDI port ${portIndex}: "${portName}"`);
      input.openPort(portIndex);

      input.on('message', (deltaTime, message) => {
        const status = message[0];
        const b1 = message[1];
        const b2 = message[2];

        switch (status) {
          case 144:
            if (b2 > 0)
              this.noteOn(b1);
            else
              this.noteOff(b1);
            break;
          case 128:
            this.noteOff(b1);
            break;
          case 176:
            this.params.update('organ-level', Math.floor(100 * (b2 / 127) + 0.5));
            break;
        }
      });
    } else {
      console.log(`> MIDI port name "${midiPortName}" not found`);
    }
  }

  setNoteOfVoice(voice, note) {
    if(note > 0)
      this.voicesOfNotes.set(note, voice);
    else
      this.voicesOfNotes.delete(voice.note);

    for(let client of voice.players) {
      this.broadcast('organ', null, 'note', client.index, note);
      this.send(client, 'note', note);
    }

    voice.note = note;
  }

  getVoiceOfNote(note) {
    return this.voicesOfNotes.get(note);
  }

  noteOn(note) {
    let voice = null;

    if(this.inactiveVoices.length > 0) {
      voice = this.inactiveVoices.pop();
    } else {
      voice = this.activeVoices.shift();
      this.setNoteOfVoice(voice, 0);
    }

    this.setNoteOfVoice(voice, note);
    this.activeVoices.push(voice);

    //console.log('ON:', this.activeVoices.map((v) => v.index), this.inactiveVoices.map((v) => v.index));
  }

  noteOff(note) {
    const voice = this.getVoiceOfNote(note);

    if(voice) {
      this.setNoteOfVoice(voice, 0);

      const idx = this.activeVoices.indexOf(voice);
      if(idx >= 0)
        this.activeVoices.splice(idx, 1);

      this.inactiveVoices.push(voice);
    }

    //console.log('OFF:', this.activeVoices.map((v) => v.index), this.inactiveVoices.map((v) => v.index));
  }

  enter(client) {
    super.enter(client);

    const clientIndex = client.index;
    const voiceIndex = clientIndex % numVoices;
    const partialIndex = Math.floor(clientIndex % (numVoices * numPartials) / numVoices);
    const layerIndex = Math.floor(clientIndex / (numVoices * numPartials));

    const voice = this.voices[voiceIndex];
    voice.players.add(client);

    this.broadcast('organ', null, 'enable', clientIndex, partialIndex, voice.note);
    this.send(client, 'enable', partialIndex + numPartials, voice.note);

    this.receive(client, 'control', (intensity, detune) => {
      this.broadcast('organ', null, 'control', clientIndex, intensity, detune);
    });

    this.params.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    const clientIndex = client.index;
    const voiceIndex = clientIndex % numVoices;
    const voice = this.voices[voiceIndex];
    voice.players.delete(client);

    this.broadcast('organ', null, 'disable', clientIndex);

    this.params.update('numPlayers', this.clients.length);
  }
}
