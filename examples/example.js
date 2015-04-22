var piMotion = require('../app.js');

var nodePiMotion = new piMotion({verbose: true, throttle: 0, night: true, sensitivity: 50});

var DEBUG = 'TEST';

nodePiMotion.on('DetectedMotion', function() {
  var date = new Date().toGMTString();
  console.log(DEBUG, date, 'Motion was detected');
});

