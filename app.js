var EventEmitter = require('events').EventEmitter;
var util = require('util');
var PythonShell = require('python-shell');
var _ = require('lodash');

var DEBUG = 'node-pi-motion';

function buildPythonArgs(opts) {
  var argMap = {
    sensitivity: 's',
    threshold: 't',
    night: 'n'
  };

  var buildArgs = _.map(opts, function(value, key) {
    if (_.isBoolean(value)) {
      if (value === true) return '-' + argMap[key];
      else return;
    }
    else return '-' + argMap[key] + ' ' + value;
  });

  return _.compact(buildArgs);
}

function NodePiMotion(opts) {
  var self = this;
  opts = opts || {};

  this.throttle = opts.throttle || 0;

  this.emitMessage = _.throttle(function() {
    self.emit('DetectedMotion');
  }, this.throttle);

  EventEmitter.call(this);

  var pythonArgs = buildPythonArgs(_.pick(opts, 'threshold', 'sensitivity', 'night'));

  var pyOptions = {
    mode: 'text',
    pythonPath: '/usr/bin/python',
    pythonOptions: ['-u'],
    scriptPath: __dirname + '/python',
    args: pythonArgs
  };

  this.pythonChild = new PythonShell('pi-motion-lite.py', pyOptions);

  this.pythonChild.on('message', function (message) {
    if (opts.verbose) console.log(DEBUG, message);
    if (message === 'DetectedMotion') {
      self.emitMessage();
    }
  });
}

util.inherits(NodePiMotion, EventEmitter);
module.exports = NodePiMotion;
