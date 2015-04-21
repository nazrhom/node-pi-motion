var child_process = require('child_process');

child_process.exec('./pi-motion-lite.py', function(error, stdout, stderr){
			if (error) {
	          console.log(error);
	          process.exit(1);
	        }
	        if(stderr) {
	          console.log(stderr);
	        }
	        if (stdout) {
            console.log(stdout)
          }
      });
	});
});
