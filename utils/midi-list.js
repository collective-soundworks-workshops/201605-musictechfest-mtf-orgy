var midi = require('midi');

var input = new midi.input();
var portCount = input.getPortCount();

console.log('Connected midi devices:')

for (var i = 0; i < portCount; i++) {
  var str = input.getPortName(i);
  console.log('- MIDI port', i.toString() + ':', '"' + str + '"');
}

process.exit();
