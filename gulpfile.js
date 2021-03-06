/**
 *	Includes
 */

var path = require('path');

// gulp & task utilities
var gulp = require('gulp');
var argv = require('yargs').argv;

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
	api: {
		rootDir: 'backend'
	},
	client: {
		rootDir: 'src'
	}
};

ENV.client.assetsDir = ENV.client.rootDir + '/assets';
ENV.client.stylesDir = ENV.client.assetsDir + '/styles';
ENV.client.commonDir = ENV.client.rootDir + '/common';
ENV.client.viewsDir = ENV.client.rootDir + '/views';


/**
 *	Tasks
 */

gulp.task('default',
	function defaultTask() {
		// place code for your default task here
	});

gulp.task('serve', serveTask);
gulp.task('watch:api', watchApiTask);
gulp.task('sass', sassTask);
gulp.task('watch:sass', watchSassTask);


/**
 *	Task defitions
 */

function serveTask() {
	var config = serveTask.config;

	// TODO: look into usage & demand npm packages for config

	// port option
	if (argv.port !== undefined) {
		config.port = argv.port;
	}
	else if (argv.p !== undefined) {
		config.port = argv.p;
	}

	// TODO: livereload
	// TODO: auto browser open
	getServer().start(config)
		.then(function(serverInstance) {
			console.log('Server started: ' + serverInstance.info.uri);

			// watch option
			if (argv.w !== undefined) {
				watchApiTask();
				watchSassTask();
			}
		});
}
serveTask.config = {
	api: ENV.api,
	client: ENV.client,
};

function watchApiTask() {
	var config = watchApiTask.config;
	return observe(config.src, function() {
			// TODO: handle restart error
			// TODO: queue up changes (gulp-batch)
			getServer().restart()
				.then(function(serverInstance) {
					console.log('Server restarted: ' + serverInstance.info.uri);
				});
		});
}
watchApiTask.config = {
	src: [
		ENV.api.rootDir + '/**/*',
		'!' + ENV.api.rootDir + '/server.js',
	],
};

function sassTask() {
	return compileSass();
}

function watchSassTask() {
	return compileSass(true);
}

function compileSass(startWatch) {
	var config = compileSass.config;
	return gulp
		.src(config.src)
		// run watch + plumber if startWatch is true
		.pipe(gulpif(!!startWatch,
			watch(config.src)
		))
		.pipe(gulpif(!!startWatch,
			plumber({
				handleError: function (err) {
					console.log(err);
					this.emit('end');
				}
			})
		))
		// run Sass + sourcemaps
		.pipe(sourcemaps.init())
		.pipe(sass(config.sassOpts))
		.pipe(sourcemaps.write())
		// write the resulting CSS to dest
		.pipe(gulp.dest(config.dest));
}
compileSass.config = {
	src: [
		ENV.client.stylesDir + '/*.scss',
		ENV.client.commonDir + '/directives/**/*.scss',
		ENV.client.viewsDir + '/**/*.scss',
	],
	dest: function(file) {
		// write resulting CSS to same directory
		return file.base;
	},
	sassOpts: {
		includePaths: [
			ENV.client.assetsDir,
		]
	},
};


/**
 * Helper functions
 */

function getServer() {
	return require('./' + ENV.api.rootDir + '/server.js');
}

function observe(source, callback) {
	console.log('Watching', source);
	return gulp
		.src(source)
		// run plumber + watch
		.pipe(plumber())
		.pipe(watch(
			source,
			function(vinyl) {
				if (vinyl.event !== undefined) {
					var filePath = path.relative(__dirname, vinyl.path);
					console.log(filePath + ' modified...');
					try {
						callback(vinyl.path);
					}
					// need this since watch seems to swallow exceptions
					catch (e) {
						console.log('stack' in e ? e.stack : e);
					}
				}
			}
		));
}
