var EventEmitter = require('events').EventEmitter;
var util = require('util');
var PythonShell = require('python-shell');
var _ = require('lodash');

var DEBUG = 'node-pi-motion';

var options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: __dirname + '/python',
  args: []
};

function NodePiMotion(opts) {
  var self = this;
  opts = opts || {};

  this.throttle = opts.throttle || 0;
  
  this.emitMessage = _.throttle(function() {
    self.emit('DetectedMotion');
  }, this.throttle);    
   
  EventEmitter.call(this);

  this.pythonChild = new PythonShell('pi-motion-lite.py', options);

  this.pythonChild.on('message', function (message) {   
    if (opts.verbose) console.log(DEBUG, ' Recieved message: ', message);
    if (message === 'DetectedMotion') {
      self.emitMessage();
    }
  });
}

util.inherits(NodePiMotion, EventEmitter);
module.exports = NodePiMotion;
