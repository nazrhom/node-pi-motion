var spawn = require('child_process').spawn;

var child = spawn('python', [__dirname + '/deps/pi-motion-lite.py']);

var chunk = '';

child.stdout.setEncoding('utf8')

child.stderr.on('data', function(data) {
    chunk += data;
});

child.stdout.on('end', function(data) {
  console.log(data)
})

child.stdout.on('close', function(data) {
  console.log(chunk)
})

child.on('close', function(code) {
    console.log('closing code: ' + code);
});
child.on('error', function (err) {
  console.log('closing code: ' + err);
})
