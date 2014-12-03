# asset-pipeline

An overly-smart approach to building your assets.

## Usage

```javascript
// Build all assets required for `index.html`
gulp.src('index.html')
	.pipe(assets)
	.pipe(gulp.dest('build'));
```

## How it Works

An initial working set of files comes into the pipeline, from which all related assets are generated and compiled.

In the following diagram the following terminology is used:

 * `->` transforms to
 * `+` references

```
index.jade
	-> index.html
		+ global.scss
			-> global.css
				+ background.jpg
		+ index.scss
			-> index.css
		+ hello.png
		+ my-web-component
			+ component.js
			+ index.html
```

## Components

### resolver

Turns URLs or paths into vinyl. Examples of things that need to be resolved include:

 * JavaScript
  * require statements `require('foo.js')`
 * CSS
  * import statements `@import url('foo.css')`,
 * HTML
  * links `<link rel="stylesheet" href="foo.css"/>`
  * images `<img src="foo.jpg" />`
  * scripts `<script src="foo.js"></script>`
  * audio `<audio src="foo.mp3"/>`
  * video `<video src="foo.webm"/>`

Using the vinyl-* family offers sometimes interesting effects like being able to use globs:

```html
<link rel="stylesheet" type="text/css" href="styles/**"/>
```

Or to suck things down directly from s3:

```html
<img src="s3://secret-bucket/image.png"/>
```

It also offers the functionality of having files you need located in directories managed by other services such as `bower` or `npm`:

```javascript
{
	include: ['./bower_components']
}
```

### processor

Traditional component in a gulp-based workflow. It takes vinyl as input and produces vinyl as output which is some transformation of the input. Can do things like compile `.scss` files, minify images and compile icon fonts.

```javascript
var images = imagemin();
```

### refs

Extraction component which takes vinyl as input and produces new vinyl as output which corresponds to files the source links to. For example, `index.html` may refer to `global.css`, so when `index.html` is processed, `global.css` file will be emitted as vinyl.

```javascript
through2.obj(function(file, enc, next) {
	var self = this,
		doc = html.parse(file.contents);
	doc.querySelectorAll('link').forEach(function(link) {
		self.push(link.href);
	});
});
```

### rewriter

After a processor has changed one thing into one or more results, the original thing has to be changed to point to the result of the processor. That is the job of the rewriter.

For example, post-processing of a lossless audio file to more bandwidth friendly ones for the web:

```html
<audio src="foo.flac"/>
```

could be rewritten into

```html
<audio>
	<source src="foo.mp3"/>
	<source src="foo.m4a"/>
</audio>
```
