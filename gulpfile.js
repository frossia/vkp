var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    server = require( 'gulp-develop-server' ),
    inject = require('gulp-inject'),
    jade = require('gulp-jade');




gulp.task('default', ['bs'], function() {
	gulp.watch('src/views/*.jade', ['jade']);
  gulp.watch('src/sass/*.sass', ['sass']);
});


/////// Jade -> HTML

gulp.task('jade', function() {
  gulp.src('./src/views/*.jade')
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('./app/'))
    //.pipe(inject(gulp.src('./app/js/*.js', {read: false})))
    //.pipe(gulp.dest('./app'));
});

/////// Sass -> AutoPrefixer -> CSS -> BS.reload

gulp.task('sass', function () {
  gulp.src('./src/sass/app.sass')
    .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
    .pipe(gulp.dest('./app/css/'))
		.pipe(browserSync.stream());
});

/////// JS

gulp.task('js', function () {

});

/////// BrowserSync ( + nodemon )

gulp.task('bs', ['sass', 'jade', 'nodemon'],  function() {
    browserSync.init({
      	open: false,
      	reloadOnRestart: true,

      	files: ['app/**/*.*'],
      	//proxy: 'http://localhost:8080',
      	port: 80,

        server: {
        	//proxy: "local.dev",	
          baseDir: "./app"
        }
    });
    gulp.watch("src/sass/*.sass", ['sass']);	
    gulp.watch("src/views/*.jade", ['jade']);	
    gulp.watch("app/*.html").on('change', browserSync.reload);
});


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////


gulp.task('nodemon', function(cb) {
  var nodemon = require('gulp-nodemon');

  // We use this `called` variable to make sure the callback is only executed once
  var called = false;

  return nodemon({
    script: 'server.js',
    watch: ['server.js']
  })

	  .on('start', function onStart() {
	    if (!called) { cb(); }
	    called = true;
	  })

	  .on('restart', function onRestart() {
	    // Also reload the browsers after a slight delay
	    setTimeout(function reload() {
	      browserSync.reload({
	        stream: false
	      });
	    }, 500);
  	});
});
