# DLTS ReadiumJS viewer

Main repo for the building and testing of the DLTS [ReadiumJS viewer](https://github.com/readium/readium-js-viewer)
used by NYU Press websites [Open Access Books](https://github.com/NYULibraries/dlts-open-access-books)
and [Connected Youth](https://github.com/NYULibraries/dlts-connected-youth).
The builds created by this project are 100% reproducible.  See [Notes on build](#notes-on-build)
for details about issues surrounding reproducibility.

See also: [dlts-readium-cloud-reader-archive](https://github.com/NYULibraries/dlts-readium-cloud-reader-archive).

### Prerequisities

* Bash (for Windows, try using the Git Bash that comes with [git for Windows](https://git-for-windows.github.io/))
* Bzip2
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

### Installation and setup

```bash
git clone git@github.com:NYULibraries/dlts-readium-js-viewer.git
cd dlts-readium-js-viewer
npm install
```
Get the ReadiumJS viewer snapshots (see [Notes on build](#notes-on-build)).  Note
that due to Github's file size restrictions we are unable to host our snapshot files
there, and in any case it would be wasteful to version control these large binary
files using git because it's likely all past versions of these *.tar.bz2 files will
persist in the `.git` directory even after being deleted, so the repo would end up
being very large.

For the time being we have them stored in NYU Box:
[dlts-readium-js-viewer-snapshots](https://nyu.box.com/s/y5e907gebxfzox5ucfby0sycb7da8vww).
Eventually we will probably move them to a file server where they can downloaded
programmatically by the build scripts.  For now, to build the current distribution
manually download the snapshot
[readium-snapshot-2016-10-04.tar.bz2](https://nyu.box.com/s/plpwqmhdjwf8hutdoy2oclh3b6ze62yn)
and place it in `snapshots/`.

### Building the production ReadiumJS viewer

* To build the `cloud-reader` instance that is currently deployed to prod:

  `npm run dist`

* To verify that it is correct:

  `npm run dist:verify`

* To deploy to a host, copy `readium-js-viewer/dist/cloud-reader/` to the proper
location on the host.

### Tests

* To test that `npm run dist` builds a correct instance:

  `npm run test:dist`

  This runs `npm run dist` followed by `npm run dist:verify`.

* To run the (not yet implemented) browser test suite against a given ReadiumJS viewer:

  `npm run test:mocha`

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
we were ready to a later version that had the fix.

The ideal solution would be for `readium-js-viewer` and all its submodule projects to
use `npm shrinkwrap` to lock the dependencies.  Unfortunately, at this time it
appears that `npm shrinkwrap` fails for `readium-js` and `readium-shared-js` projects.

To prevent the possibility of our build process breaking again, and to ensure that
we our `cloud-reader` build is 100% reproducible, our build system uses a snapshot
of the `readium-js-viewer` file-system including all submodules and `node_modules`
directories that were used to build our current prod `cloud-reader`.
