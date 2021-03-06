# DLTS ReadiumJS viewer

Main repo for the building and testing of the DLTS [ReadiumJS viewer](https://github.com/readium/readium-js-viewer)
used by NYU Press websites [Open Square](https://github.com/NYULibraries/dlts-open-square)
and [Connected Youth](https://github.com/NYULibraries/dlts-connected-youth).

See also: [dlts-readium-cloud-reader-archive](https://github.com/NYULibraries/dlts-readium-cloud-reader-archive).

### Prerequisities

* Bash (for Windows, try using the Git Bash that comes with [git for Windows](https://git-for-windows.github.io/))
* Git
* NodeJS version 4.x or higher (for ES6 support).  For doing NPM operations based
on the `package.json` at the root of this repo, any NodeJS version higher than
4.x should be fine.  However, if after running the build you wish to go inside
the built ReadiumJS viewer instance to do the NPM tasks specified by Readium's
repos, check the *Prerequisites*  section of the ReadiumJS viewer
[README.md](https://github.com/readium/readium-js-viewer/blob/master/README.md)
for information about which Node and NPM versions are recommended.
* [Expect](https://core.tcl.tk/expect/index) (if using the deploy shell scripts)


* [yarn](https://yarnpkg.com/): see [readium-js-viewer/package.json](https://github.com/readium/readium-js-viewer/blob/master/package.json)
for required minimum version.

### Installation and setup

```bash
git clone git@github.com:NYULibraries/dlts-readium-js-viewer.git
cd dlts-readium-js-viewer
npm install
```

### Building the production ReadiumJS viewer

* To build the `cloud-reader` instance that is currently deployed to prod:

  `npm run dist`

* To verify that it is correct:

  `npm run dist:verify`

* To deploy to a host, copy `readium-js-viewer/dist/cloud-reader/` to the proper
location on the host.

### Tests

#### Build

* To test that `npm run dist` builds a correct instance:

  `npm run test:dist`

  This runs `npm run dist` followed by `npm run dist:verify`.

#### Deploy

Deploy only after first running the [build task](#build).  These deploy tasks by
design do not include a build step.  The commands for deploying to the dev, stage,
and prod servers:

  `npm run deploy:dev`

  `npm run deploy:stage`

  `npm run deploy:prod`

These tasks run the deploy scripts in `scripts/` and then run the tests against
the target server instance after the application has been deployed.

#### Automated browser tests

Selenium-driven UI tests of the DLTS build of ReadiumJS viewer are written using
[webdriver.io](http://webdriver.io/) and [mocha](https://mochajs.org/).

* To run the full test suite against a local instance of DLTS ReadiumJS viewer
in both Chrome and Firefox simultaneously:

```shell
npm run test:browser:local
```

* To debug the tests for a specific browser:

```shell
npm run test:browser:local:debug:chrome
```

...or:

```shell
npm run test:browser:local:debug:firefox
```

These debug `wdio` configuration files set the test timeout to an extremely
high value to allow for pausing at breakpoints and other line-debugging operations
that would not be possible under normal timeout conditions.

* To run the tests against the dev, stage, and prod server application instances:

`npm run test:browser:dev`

`npm run test:browser:stage`

`npm run test:browser:prod`

* To run specific test suites, pass in the `--suite` option as specified in
[Group Test Specs](http://webdriver.io/guide/testrunner/organizesuite.html):

```shell
# Run 3 tests suites against both Chrome and Firefox
npm run test:browser:local -- --suite navbar,navbarShowAndHide,settings

# Run a single test suite against either Chrome or Firefox
npm run test:browser:local:debug:chrome -- --suite youtube
npm run test:browser:local:debug:chrome -- --suite toc
```

The `suites` property in
[test/browser/conf/wdio.main.conf.js](https://github.com/NYULibraries/dlts-readium-js-viewer/blob/master/test/browser/conf/wdio.main.conf.js)
contains the definitions for the available test suites.
 
**Note on Firefox testing**

Mozilla uses automation protocol [Marionette](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette).
Selenium being WebDriver-based needs to use the WebDriver <-> Marionette proxy
[geckodriver](https://github.com/mozilla/geckodriver) which is not yet feature
complete -- see [WebDriver Status](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver/status).
As a result, Firefox testing tends to be a bit trickier.

**Test flake**

Note that Chrome fullscreen tests will always fail in headless mode.
This command can be used to run properly test fullscreen functionality:

`npm run test:browser:local:debug:chrome -- --suite fullscreen`

The is also a non-deterministic error that can pop up when running the YouTube video
tests in Firefox: "TypeError: can't access dead object".  This could be the result
of an outstanding geckodriver bug: ["TypeError: can't access dead object" if the frame is removed from under us \#614](https://github.com/mozilla/geckodriver/issues/614).

If experiencing flake while running tests other than these, try lowering the value
of `maxInstances` in `wdio.main.conf.js` to reduce concurrency.  In theory there
shouldn't be any interference caused by running the test suites concurrently in
many browser instances, but in practice it does seem to reduce test flake,
particularly on less powerful machines.
