/**
 *	Includes
 */

// gulp & task utilities
var gulp = require('gulp');
var argv = require('yargs').argv;

// server
var server = require('./backend/server');

// dev dependencies
var gulpif = require('gulp-if');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
// styles
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
// es6
var traceur = require('gulp-traceur');


/**
 * Env
 */

var ENV = {
	client: {
		path: 'src'
	}
};


/**
 *	Tasks
 */

gulp.task('default',
	function defaultTask() {
		// place code for your default task here
	});

gulp.task('serve', serveTask);
gulp.task('watch:sass', watchSassTask);
gulp.task('sass', sassTask);


/**
 *	Task defitions
 */

function serveTask() {
	var options = {
		api: true,
		client: true
	};

	// TODO: look into usage & demand npm packages for options

	// port option
	if (argv.port !== undefined) {
		options.port = argv.port;
	}
	else if (argv.p !== undefined) {
		options.port = argv.p;
	}

	// watch option
	if (argv.w !== undefined) {
		watchSassTask();
	}

	// TODO: livereload
	// TODO: auto browser open
	server.start(options);
}

function watchSassTask() {
	return compileSass(true);
}

function sassTask() {
	return compileSass();
}

function compileSass(startWatch) {
	var config = compileSass.config;
	return gulp
		.src(config.src)
		// run watch + plumber if startWatch is true
		.pipe(gulpif(!!startWatch, watch(config.src)))
		.pipe(gulpif(!!startWatch, plumber()))
		// run Sass + sourcemaps
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		// write the resulting CSS to dest
		.pipe(gulp.dest(config.dest));
}
compileSass.config = {
	src: [
		ENV.client.path + '/assets/styles/*.scss',
		ENV.client.path + '/common/directives/**/*.scss',
		ENV.client.path + '/views/**/*.scss',
	],
	dest: function(file) {
		// write resulting CSS to same directory
		return file.base;
	}
};
