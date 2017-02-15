# DLTS ReadiumJS viewer

Main repo for the building and testing of the DLTS [ReadiumJS viewer](https://github.com/readium/readium-js-viewer)
used by NYU Press websites [Open Access Books](https://github.com/NYULibraries/dlts-open-access-books)
and [Connected Youth](https://github.com/NYULibraries/dlts-connected-youth).
The builds created by this project are 100% reproducible.  See [Notes on build](#notes-on-build)
for details about issues surrounding reproducibility.

See also: [dlts-readium-cloud-reader-archive](https://github.com/NYULibraries/dlts-readium-cloud-reader-archive).

### Prerequisities

* Bash (for Windows, try using the Git Bash that comes with [git for Windows](https://git-for-windows.github.io/))
* Git
* NodeJS version 4.x or higher (for ES6 support).  For doing NPM operations based
on the `package.json` at the root of this repo, any NodeJS version higher than
4.x should be fine.  However, if after running the build you wish to go inside
the built ReadiumJS viewer instance to do the NPM tasks specified by Readium's
repos, do not use a NodeJS version higher than v4 -- from the ReadiumJS viewer
[README.md](https://github.com/readium/readium-js-viewer/blob/master/README.md):

```
NodeJS ( https://nodejs.org ) v4 (but not v5, because the installer ships with
NPM v3 which seems to have bugs related to the new flat module dependencies)
```
* [yarn](https://yarnpkg.com/): use version v0.20.3 or higher to avoid the bug
fixed by [Add hash to cache path for non-NPM packages #2074](https://github.com/yarnpkg/yarn/pull/2074).
See [Caveats](###Caveats).

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

* To run the (not yet implemented) browser test suite against a given ReadiumJS viewer:

  `npm run test:mocha`

#### Automated browser tests

Selenium-driven UI tests of the DLTS build of ReadiumJS viewer are written using
[webdriver.io](http://webdriver.io/) and [mocha](https://mochajs.org/).  To run
them, first make sure Selenium is running on the default port with the paths to
the Chrome and Firefox drivers set.

```shell
 cd test/browser/selenium
 java -jar -Dwebdriver.gecko.driver=drivers/geckodriver/mac64/geckodriver \
           -Dwebdriver.chrome.driver=drivers/chromedriver/mac64/chromedriver \
           selenium-server-standalone.jar
```

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

Mozilla is in the process of transitioning to their next generation of automation
driver, [Marionette](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette).
Marionette is not yet complete.  Selenium is no longer able to automate Firefox
without the aid of a 3rd-party driver.  It is now necessary to provide to
Selenium the external driver currently still under development by Mozilla:
[geckodriver](https://github.com/mozilla/geckodriver).  `geckodriver` does not
yet fully implement the WebDriver protocol --
see [WebDriver Status](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver/status).

As a result, there are a few tests that will always fail in Firefox
until the `geckodriver` WebDriver <-> Marionette proxy is complete.  See
[NYUP-206](https://jira.nyu.edu/jira/browse/NYUP-206) for more details.

### Notes on build

The way that the [readium-js-viewer](https://github.com/readium/readium-js-viewer)
project is currently set up does not allow for building a `dist/cloud-reader/`
with absolute reliability, and might also make it impossible to build a fixed version
on demand for an indefinite period (this needs to be verified).

The reason is that the dependencies in the
[package.json](https://github.com/readium/readium-js-viewer/blob/master/package.json)
are not fixed to particular versions, and the `npm run prepare` script does an `npm update`
each time it is run.  There has been at least one case where the update of `node_modules`
caused the build to break: [Fix version of node module cpy #44](https://github.com/readium/readium-cfi-js/pull/44).
This particular build bug prevented us from re-creating our `cloud-reader` non-optimized
and `dev/` readers.  We were forced to update our `readium-js-viewer` before we
we were ready to a later version that had the fix.  Readium has an open ticket
for this problem:
[NPM build process, semantic versioning on external dependencies, bind to major versions #432](https://github.com/readium/readium-js-viewer/issues/432)

The ideal solution would be for `readium-js-viewer` and all its submodule projects to
use `npm shrinkwrap` to lock the dependencies.  Unfortunately, at this time it
appears that `npm shrinkwrap` fails for `readium-js` and `readium-shared-js` projects.

To prevent the possibility of our build process breaking again, and to ensure that
our `cloud-reader` build is 100% reproducible, our build system uses
[yarn](https://yarnpkg.com/) to lock the dependencies of the Readium projects.

### Caveats

#### Failed `npm run test:dist` due to `yarn` bug

There is a bug in versions of `yarn` older than v0.20.3 that can cause a wrong
version of a dependency to be installed from cache under certain circumstances.
For details see the bugfix PR:
[Add hash to cache path for non-NPM packages #2074](https://github.com/yarnpkg/yarn/pull/2074).

If `npm run dist:verify` fails, try doing a `yarn cache clean` and running the test
again.  `yarn` should then download and cache the correct code as specified in the
`yarn.lock`.
