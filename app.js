var PythonShell = require('python-shell');
var _ = require('lodash');
var psTree = require('ps-tree');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');

var DEBUG = 'node-pi-motion';

var kill = function (pid, signal) {
  // Follow default process.kill behavior
  signal = signal || 'SIGTERM';

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

  self.throttle = opts.throttle || 0;
  self.autorestart = opts.autorestart || false;
  self.verbose = opts.verbose || false;
  self.debug = opts.debug || false;

  /* Refer to https://github.com/lodash/lodash/issues/222 and
     http://benalman.com/projects/jquery-throttle-debounce-plugin
     for a discussion about the trailing and leading options */
  self.detectedMotion = _.throttle(function() {
    self.emit('DetectedMotion');
  }, self.throttle, {trailing: false});

  EventEmitter.call(self);

  if (self.debug) {
    setInterval(function() {
      self.detectedMotion();
    }, self.debug);
    return
  }

  var pythonArgs = buildPythonArgs(_.pick(opts, 'threshold', 'sensitivity', 'night'));

  self.pyOptions = {
    mode: 'text',
    pythonPath: opts.pythonPath || '/usr/bin/python',
    pythonOptions: ['-u'],
    scriptPath: path.join(__dirname, 'python'),
    args: pythonArgs
  };

  self.pythonChild = new PythonShell('pi-motion-lite.py', self.pyOptions);

  self.attachListeners();
}

util.inherits(NodePiMotion, EventEmitter);

NodePiMotion.prototype.attachListeners = function () {
  var self = this;

  self.pythonChild.on('message', function(message) {
    var data;
    var split = message.split('-');

    message = split[0];
    data = split[1];

    if (message === 'DetectedMotion') {
      self.detectedMotion();
    } else if (message === 'ready') {
      // When the script emits ready it will also pass the number of seconds before the first check will occur
      setTimeout(function() {
        self.ready();
      }, data * 1000);
    } else if (self.verbose) console.log(DEBUG, split.join('-'));

  });

  self.pythonChild.on('error', function(err) {
    if (self.verbose) console.log(DEBUG, 'Python script errored with error: ', err);

    // The error event is fired on non 0 exit or when writing to stderr so we want to make sure the
    // script has actually exited before eventually restarting it
    self.close();

    console.log(self.pythonChild);

    self.emit('error', err);
  });

  self.pythonChild.on('close', function () {
    if (self.verbose) console.log(DEBUG, 'Python script has exited');
    if (self.autorestart) {
      // Restart the script at a random timeframe in the next five seconds
      setTimeout(function() {
        self.pythonChild = new PythonShell('pi-motion-lite.py', self.pyOptions);
        self.attachListeners();
      }, Math.random() * 5000);
    }
  });
}

NodePiMotion.prototype.close = function () {
  var self = this;
  if (!self.pythonChild.terminated) {
    if (self.verbose) console.log(DEBUG, 'Killing python script...');
    self.pythonChild.end()
    kill(self.pythonChild.childProcess.pid, 'SIGTERM');
  }
}

NodePiMotion.prototype.ready = function () {
  this.emit('ready');
}

module.exports = NodePiMotion;
