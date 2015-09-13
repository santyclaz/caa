var gulp = require('gulp');

var traceur = require('gulp-traceur');

var server = require('./backend/server');


gulp.task('default',
	function() {
		// place code for your default task here
	});

gulp.task('serve',
	function() {
		// TODO: livereload
		// TODO: auto browser open
		server.start();
	});
