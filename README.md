# node-pi-motion

This module uses [pi-motion-lite](https://github.com/pageauc/pi-motion-lite) to detect movement on a RaspberryPi.

### EXAMPLE USAGE

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

### OPTIONS

#### General
- `verbose` - If true the pi-motion-lite script will output its debug info. (default: `false`)
- `pythonPath` - The path where python is installed on your machine (default: `/usr/bin/python`)
- `autorestart` - If true the pi-motion-lite script will automatically keep getting restarted on exit (default: `false`)

#### Camera
- `throttle` - Set a value in ms to enable throttling on motion detection events. (default: `0`)
- `night` - If true the script will apply night modifiers to the camera. (default: `false`)
- `sensitivity` - How Many pixels need to change for motion detection. (default: `200`)
- `threshold` - How Much a pixel has to change. (default: `10`)
