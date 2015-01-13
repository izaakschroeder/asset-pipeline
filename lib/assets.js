
var _ = require('lodash'),
	Promise = require('bluebird');


var URI = require('./uri'),
	parser = require('./parser'),
	transformer = require('./transformer'),
	type = require('./util/type');


var async = require('async'),
	typeis = require('type-is'),
	through2 = require('through2'),
	terminus = require('terminus'),
	duplex = require('plexer');



module.exports = function pipeline(options) {

	var context,
		source = through2.obj(),
		destination = through2.obj();

	var cache = { };

	function stream() {

		var input = type(),
			output;

		output = input.pipe(parser(options, context))
			.pipe(transformer(options, context));

		var stream = duplex({ objectMode: true }, input, output);

		var promise = new Promise(function promise(resolve, reject) {
			stream
				.pipe(terminus.concat({ objectMode: true }, resolve))
				.on('error', reject);
		});

		// Make the stream act like a promise lol
		stream.then = _.bind(promise.then, promise);
		stream.finally = _.bind(promise.finally, promise);
		stream.catch = _.bind(promise.catch, promise);

		return stream;
	}

	// glob include paths - how to deal with?
	// includepaths = [ 'assets' ] so if one requests
	// images/*.jpg how to tell if use includepath? guess -
	// check 'assets/images', if exists then set that as path,
	// else try next

	function files(uri) {
		// should this always be piped to output then? since once
		// it is on disk we have a path for it thus can make url?
		if (cache[uri]) {
			return cache[uri]();
		} else {
			return URI(uri).pipe(stream());
		}
	}

	function uri(file) {
		return 'foo';
	}

	context = { stream: source, files: files, uri: uri };
	return source.pipe(stream());
}
