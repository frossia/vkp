gulp           = require('gulp')
gutil          = require('gulp-util')
coffeelint     = require('gulp-coffeelint')
coffee         = require('gulp-coffee')
sourcemaps     = require('gulp-sourcemaps')
sass           = require('gulp-sass')
concat         = require('gulp-concat')
autoprefixer   = require('gulp-autoprefixer')
browserSync    = require('browser-sync').create()
server         = require('gulp-develop-server')
inject         = require('gulp-inject')
mainBowerFiles = require('main-bower-files')
jade           = require('gulp-jade')
ngClassify     = require 'gulp-ng-classify'
stylus         = require('gulp-stylus')
autoprefixerS  = require('autoprefixer-stylus')
axis           = require('axis')
plumber        = require('gulp-plumber')


handleError = (err) ->
	console.log err.toString()
	@.end
	return



#///// Jade -> HTML
gulp.task 'jade', ->
	gulp.src('./src/views/**/*.jade')
		.pipe(jade(pretty: true).on('error', gutil.log))
		.pipe gulp.dest('./app/')
	#.pipe(inject(gulp.src('./app/js/*.js', {read: false})))
	#.pipe(gulp.dest('./app'));
	return

#///// Sass -> AutoPrefixer -> CSS -> BS.reload
gulp.task 'sass', ->
	gulp.src('./src/sass/app.sass').pipe(sass.sync().on('error', sass.logError)).pipe(autoprefixer(
		browsers: [ 'last 2 versions' ]
		cascade: false)).pipe(gulp.dest('./app/css/')).pipe browserSync.stream()
	return

gulp.task 'stylus', ->
	gulp.src('src/styl/main.styl')
		.pipe(stylus(
			'include css': true
			use: [ axis(), autoprefixerS('iOS >= 7', 'last 2 Chrome version') ]
		).on('error', handleError))
		.pipe gulp.dest('app/css/')
		.pipe browserSync.stream()




#///// JS
gulp.task 'js', ['scripts'], ->
	gulp.watch 'src/coffee/*.coffee', [ 'scripts' ]

gulp.task 'scripts', ->
	gulp.src('src/coffee/*.coffee')
		.pipe(plumber())
		.pipe ngClassify (file) ->
			{appName: 'vkp'}
		.pipe gulp.dest('src/coffee/tmp/coffee')
		.pipe(coffee({bare: true}).on('error', handleError))
		.pipe gulp.dest('src/coffee/tmp/js')
		.pipe concat('main.js')
		.pipe gulp.dest('app/js')






gulp.task 'default', [
	'mainBowerFiles'
	'bs'
], ->
	gulp.watch 'src/views/**/*.jade', [ 'jade' ]
	gulp.watch 'src/sass/**/*.sass', [ 'sass' ]
	return

gulp.task 'mainBowerFiles', ->
	gulp.src(mainBowerFiles()).pipe gulp.dest('./app/js/vendor')


#///// BrowserSync ( + nodemon )
gulp.task 'bs', [
	'sass'
	'stylus'
	'jade'
	'scripts'
	'nodemon'
], ->
	browserSync.init
		open: false
		reloadOnRestart: true
		ghostMode: false
		notify: false
		files: [ 'app/**/*.*' ]
		port: 80
		server: baseDir: './app'
	gulp.watch 'src/sass/*.sass', [ 'sass' ]
	gulp.watch 'src/views/*.jade', [ 'jade' ]
	gulp.watch 'src/coffee/*.coffee', [ 'scripts' ]
	gulp.watch 'src/styl/**/*.styl', [ 'stylus' ]
	gulp.watch('app/*.html').on 'change', browserSync.reload
	return
#///////////////////////////////////////////////////////////
#///////////////////////////////////////////////////////////
gulp.task 'nodemon', (cb) ->
	nodemon = require('gulp-nodemon')
	# We use this `called` variable to make sure the callback is only executed once
	called = false
	nodemon(
		script: 'server.js'
		watch: [ 'server.js' ]).on('start', ->
		if !called
			cb()
		called = true
		return
	).on 'restart', ->
		# Also reload the browsers after a slight delay
		setTimeout (->
			browserSync.reload stream: false
			return
		), 500
		return
