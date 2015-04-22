# node-pi-motion

This module uses LINK PI MOTION to detect movement on a RaspberryPi.

## EXAMPLE USAGE

```
var PiMotion = require('node-pi-motion');

var options = {
  verbose: true,
  throttle: 200
}

var nodePiMotion = new PiMotion(options);

nodePiMotion.on('DetectedMotion', function() {
  console.log('Motion detected! Now do something.');
});
```

## OPTIONS

- `verbose` - If true the pi-motion-lite script will output its debug info (default: `false`)
- `throttle` - Set a value in ms to enable throttling on detection events. (default: `0`)
