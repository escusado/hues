# Fortuna Bot

A bot that links two strangers with a random conversation starter: share
ideas, have fun with random people.

## Usage

### Run with default config (`config/config.json`)

`npm run`

### Run with custom config path

`bin/fortunabot path/to/config.json`

## Config Keys

These are the keys required or available in the config object.

TBD

Need for firebase.
Need also for twitter.

## Documentation

Fortuna Bot is documented with JSDoc. To generate all the files you can
run `npm run document`. HTML files will be generated in `./docs` which
can be viewed by opening the files or serving them with an HTTP server
(an easy way is to run `python -m SimpleHTTPServer`)

## Tests

To run the tests just run `npm test`. Right now we depend on `mocha` for
this, so make sure it's installed.
