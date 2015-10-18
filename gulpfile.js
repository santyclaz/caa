var gulp = require('gulp');
var argv = require('yargs').argv;

var traceur = require('gulp-traceur');

var server = require('./backend/server');


gulp.task('default',
	function() {
		// place code for your default task here
	});

gulp.task('serve',
	function() {
		var options = {
			api: true,
			client: true
		};

		// Port option
		var port = false;
		if (argv.port !== undefined) {
			port = argv.port;
		}
		else if (argv.p !== undefined) {
			port = argv.p;
		}

		if (typeof port === 'number') {
			options.port = port;
		}
		else {
			// TODO: look into usage & demand npm packges
			throw Error('Invalid port "' + port + '"');
		}

		// TODO: livereload
		// TODO: auto browser open
		server.start(options);
	});
