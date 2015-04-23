var PythonShell = require('python-shell');
var _ = require('lodash');
var psTree = require('ps-tree');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');

var DEBUG = 'node-pi-motion';

var kill = function (pid, signal) {
  // Follow default node behavior
  signal = signal || 'SIGKILL';
  
  psTree(pid, function(err, children) {
    var pids = [pid].concat(_.map(children, _.partialRight(_.pick, 'PID')));
    _.forEach(pids, function(tpid) {
      try { process.kill(tpid, signal) }
      catch (ex) { }
    });
  });
}

var buildPythonArgs = function (opts) {
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
  this.autorestart = opts.autorestart || false;

  this.emitMessage = _.throttle(function() {
    self.emit('DetectedMotion');
  }, this.throttle);

  EventEmitter.call(this);

  var pythonArgs = buildPythonArgs(_.pick(opts, 'threshold', 'sensitivity', 'night'));

  var pyOptions = {
    mode: 'text',
    pythonPath: opts.pythonPath || '/usr/bin/python',
    pythonOptions: ['-u'],
    scriptPath: path.join(__dirname, 'python'),
    args: pythonArgs
  };

  this.pythonChild = new PythonShell('pi-motion-lite.py', pyOptions);

  this.pythonChild.on('message', function (message) {
    if (opts.verbose) console.log(DEBUG, message);
    if (message === 'DetectedMotion') {
      self.emitMessage();
    }
  });

  this.pythonChild.on('error', function(err) {
    if (opts.verbose) console.log(DEBUG, 'Python script errored with error: ', err);
    
    // The error event is fired on non 0 exit or when writing to stderr so we want to make sure the 
    // script has actually exited before eventually restarting it
    if (!self.pythonChild.terminated) {
      if (opts.verbose) console.log(DEBUG, 'Killing python script...');
      kill(self.pythonChild.pid, 'SIGTERM')
    }
  });

  this.pythonChild.on('close', function() {
    if (opts.verbose) console.log(DEBUG, 'Python Script has exited');
  });
}

util.inherits(NodePiMotion, EventEmitter);
module.exports = NodePiMotion;
