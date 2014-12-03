
var _ = require('lodash');

var whacko = require('whacko');

var url = require('url');

var lazypipe = require('lazypipe');

var defaults = {
	'stylesheet': 'text/css',
	'script': 'text/javascript',
	'import': 'text/html'
};

var through2 = require('through2');

function dataToVinyl(url) {
	var parts = url.match(/^data:([^;]);([^,]),(.*)/);
	if (!parts) {
		throw new TypeError();
	}
	var file = new File({
		contents: new Buffer(parts[3], parts[2])
	});
	file.contentType = parts[1];

	var emitted = false;

	var res = through2.obj();
	res.push(file);
	return res;
}


var handlers = {
	'http:': require('vinyl-request'),
	'https:': require('vinyl-request'),
	'data:': dataToVinyl,
	's3:': require('vinyl-s3'),
	'file:': require('vinyl-fs'),
	'': require('vinyl-fs')
}

var mime = require('mime');

mime.define({
	'text/jade': [ 'jade' ]
});

var type = function(type) {
	return through2.obj(function(file, _, callback) {
		file.contentType = type || mime.lookup(file.path);
		callback(null, file);
	});
}

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
	'text/jade': lazypipe()
	.pipe(require('gulp-jade'))
	.pipe(type, 'text/html')
};

var extractors = {
	'text/html': function(data) {
		var $ = whacko.load(data);

		var links = $('link').map(function() {
			var href = $(this).attr('href'),
			type = $(this).attr('text/css');
			return { href: href, type: type };
		}).get();

		var scripts = $('script').map(function() {
			var src = $(this).attr('src'),
			type = $(this).attr('type') || 'text/javascript',
			data = $(this).text();
			if (data) {
				return {
					href: 'data:' + type +
					';base64,'+ Buffer(data).toString('base64'),
					type: type
				};
			} else {
				return {
					href: src,
					type: type
				};
			}
		}).get();

		var images = $('img').map(function() {
			return {
				href: $(this).attr('src')
			}
		});

		var videos = $('video').map(function() {
			return null;
		});

		var audio = $('audio').map(function() {
			return null;
		});

		return _.concat(links, scripts, images, videos, audio);
	},
	'text/javascript': function(data) {
		var ast = esprima.parse(data);
	},
	'text/css': function(data) {
		var ast = css.parse(data);
	}
}


var async = require('async'), typeis = require('type-is');

function setup(options) {
	return through2.obj(function (file, enc, next) {
		file.processors = _.mapValues(processors, function(processor) {
			return processor();
		});
		next(null, file);
	});
}

function analyzer(options) {
	return through2.obj(function doitfaggot(file, enc, next) {
		var list = _.where(processor, function(processor, accepts) {
			return typeis.match(accepts, file.contentType)
		});

		if (list.length === 0) {
			return next(null, file);
		}

		async.forEach(list, function(entry, next) {
			entry.write(file, enc, next);
		}, next);
	});
}


function extractor(options) {
	return through2.obj(function extract(file, enc, next) {

		this.push(file);

		// Can't extract anything with no data.
		if (!file.isStream() && !file.isBuffer()) {
			next();
			return;
		}

		if (!file.contentType) {
			console.log('NO TYPE FOR', file);
			next();
			return;
		}

		var self = this;

		var extractor = extractors[file.contentType],
		refs = extractor(file.contents);

		console.log('REFS', refs);

		handlers[ref](ref).pipe(options.to);

		next();
		*/
	});
}

var gulp = require('gulp');

gulp.task('default', function () {

	var chain = through2.obj();

	chain
	.pipe(type())
	.pipe(extractor({ to: chain }))
	.pipe(analyzer({ to: chain }));


	return gulp.src('assets/views/*')
	.pipe(setup())
	.pipe(chain)
	.pipe()
	.pipe(gulp.dest('build'));
});
