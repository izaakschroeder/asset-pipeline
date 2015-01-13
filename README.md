# asset-pipeline

An overly-smart approach to building your assets.

## Features

 * Use existing gulp workflows
 * Embed only exactly what's needed
 * Versioning
 * Dependency management

## Usage

```javascript

```

## How It Works

 * Create a stream with `pipeline(...)`
 * Anything fed through that stream is first sent for dependency analysis
 * Dependencies are extracted and sent down the original pipeline
 * Wait for all dependencies to be resolved/processed
 * Rewrite existing file to map scanned dependencies to resolved ones
 * Send rewritten file for transformation (i.e. existing gulp flow)
 * Pass transformed file as output

Parser gets file, creates references, references sent out to the pipeline, parser waits until all references are resolved, rewrites the original file, sends it out.

## Other Frameworks
 * [mincer] no automatic dependencies, no support for gulp, no custom urls

[mincer]: https://github.com/nodeca/mincer
