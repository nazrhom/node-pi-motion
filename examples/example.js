var piMotion = require('../app.js');

var nodePiMotion = new piMotion({verbose: false, throttle: 0});

var DEBUG = 'TEST';

nodePiMotion.on('DetectedMotion', function() {
  var date = new Date().toGMTString();
  console.log(DEBUG, date, 'Motion was detected');
});

