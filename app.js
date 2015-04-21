// var spawn = require('child_process').spawn;
//
// var child = spawn('python', [__dirname + '/deps/pi-motion-lite.py', '-u']);
//
// var chunk = '';
//
// child.stdout.setEncoding('utf8')
//
// child.stderr.on('data', function(data) {
//   console.log('in data')
//     chunk += data;
// });
//
// child.stderr.on('close', function(data) {
//   console.log('in close')
//   console.log(data)
// })
// child.stdout.on('end', function(data) {
//   console.log(data)
// })
//
// child.stdout.on('close', function(data) {
//   console.log('in close')
//   console.log(chunk)
// })

var PythonShell = require('python-shell');

var options = {
  mode: 'text',
  pythonPath: 'usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: 'deps',
  args: []
};

var child = new PythonShell('pi-motion-lite.py')

child.on('message', function (message) {
  console.log(message)
})
