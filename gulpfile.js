
var magic = require('./lib/assets');

var gulp = require('gulp');
var lazypipe = require('lazypipe');

/*

var processors = {
'text/css': lazypipe()
.pipe(require('gulp-autoprefixer'))
.pipe(require('gulp-minify-css')),
'text/scss': lazypipe()
.pipe(require('gulp-sass'))
.pipe(type, 'text/css'),
'image/*': lazypipe()
.pipe(require('gulp-imagemin'), { progressive: true }),
'text/javascript': lazypipe()
.pipe(through2.obj),
'text/html': lazypipe()
.pipe(require('gulp-minify-html')),

	.pipe(type, 'text/html')
};
*/

var jade = require('gulp-jade'),
	sass = require('gulp-sass');




gulp.task('default', function () {

	var transforms = {
		'text/jade': lazypipe().pipe(jade),
		'text/scss': function(options, context) {
			return sass({
				importer: function(uri, prev, done) {
					context.uri(uri, done);
				}
			});
		}
	};

	return gulp.src('assets/views/*')
		.pipe(magic({
			transforms: transforms
		}))
		.pipe(gulp.dest('build'));
});
