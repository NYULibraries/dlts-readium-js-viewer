#!/usr/bin/env bash

set -x

ROOT=$(cd "$(dirname "$0")" ; cd ..; pwd -P )

# Determine reader version to build
VERSIONS_DIR=${ROOT}/versions

READIUM_JS_VIEWER_VERSION=$1

# Default to prod if no version arg is provided
if [ -z "${READIUM_JS_VIEWER_VERSION}" ]
then
    echo >&2 -n "ERROR: You must specify a version to build.  See ${VERSIONS_DIR} for available versions."
    exit 1
fi

VERSION_SCRIPT=$VERSIONS_DIR/${READIUM_JS_VIEWER_VERSION}.sh
if [ ! -e $VERSION_SCRIPT ]
then
    echo >&2 "ERROR: VERSION_SCRIPT \"${VERSION_SCRIPT}\" does not exist."
    exit 1
fi

# Get version-specific code
source $VERSION_SCRIPT

# `yarn` must be available.
# Decided against including it in this repo as NPM module dependency because
# `npm install yarn` outputs a recommendation to install `yarn` natively instead.
which yarn
if [ $? -ne 0 ]
then
    echo >&2 'ERROR: you must have `yarn` installed: https://yarnpkg.com/en/docs/install.'
    exit 1
fi

READIUM_JS_VIEWER=${ROOT}/readium-js-viewer

TMP=${ROOT}/tmp

DLTS_PLUGIN_DIR=${READIUM_JS_VIEWER}/readium-js/readium-shared-js/plugins/dltsRjsPluginOpenSquare
DLTS_PLUGIN_GITHUB_REPO='git@github.com:NYULibraries/dlts-rjs-plugin-open-square.git'

DIST=$READIUM_JS_VIEWER/dist
CLOUD_READER=$DIST/cloud-reader

git clone --recursive -b master https://github.com/readium/readium-js-viewer.git $READIUM_JS_VIEWER

if [ ! -d $READIUM_JS_VIEWER/.git ]
then
    echo >&2 'ERROR: clone of https://github.com/readium/readium-js-viewer.git failed.'
    exit 1
fi

cd $READIUM_JS_VIEWER
git submodule update --init --recursive

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: `git submodule update --init --recursive` failed.'
    exit 1
fi

git checkout master && git submodule foreach --recursive "git checkout master"

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: `git checkout master && git submodule foreach --recursive "git checkout master"` failed.'
    exit 1
fi

# Set up main repo
# Have to do a checkout before hard reset, because $READIUM_JS_VIEWER_COMMIT might
# be a branch name, which is not automatically checked out.  Apparently doing a
# checkout of a specific commit ID is fine even if the commit is not in a local
# branch.
git checkout $READIUM_JS_VIEWER_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git checkout ${READIUM_JS_VIEWER_COMMIT}\` failed."
    exit 1
fi

git reset --hard $READIUM_JS_VIEWER_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git reset --hard ${READIUM_JS_VIEWER_COMMIT}\` failed."
    exit 1
fi

yarn

# Set up submodules.  Note that branches for sub-modules need to be detached HEADs
# to get exact match with expected cloud-reader version info.
cd readium-js/
git checkout $READIUM_JS_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git checkout ${READIUM_JS_COMMIT}\` failed."
    exit 1
fi

yarn

cd readium-shared-js/
git checkout $READIUM_SHARED_JS_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git checkout ${READIUM_SHARED_JS_COMMIT}\` failed."
    exit 1
fi

yarn

# Clone DLTS plugin
git clone $DLTS_PLUGIN_GITHUB_REPO $DLTS_PLUGIN_DIR

if [ ! -d $DLTS_PLUGIN_DIR/.git ]
then
    echo >&2 "ERROR: clone of $DLTS_PLUGIN_GITHUB_REPO failed."
    exit 1
fi

cd $DLTS_PLUGIN_DIR
git checkout $DLTS_PLUGIN_GITHUB_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git checkout ${DLTS_PLUGIN_GITHUB_COMMIT}\` failed."
    exit 1
fi

# Create plugins-override.cson
cat << EOF > $READIUM_JS_VIEWER/readium-js/readium-shared-js/plugins/plugins-override.cson
plugins:
  include: [
    'dltsRjsPluginOpenSquare'
    ${EXTRA_PLUGINS}
  ]
  exclude: [
  ]
EOF


# We can't run Readium's `yarn run prepare:yarn:all` because it will force updates
# of the
# node modules due to this command in package.json:
#
#     "prepare:yarn:local": "yarn outdated || echo outdated && yarn install && yarn upgrade && yarn run prepare:local:common",
#
# `yarn outdated` often returns true for many packages, causing `yarn upgrade` to
# run, which updates the modules and rewrites yarn.lock.
#
# So, we run everything from Readium's prepare task ourselves, minus the yarn
# upgrades and calls to `readium-cfi-js/readium-build-tools/gitHubForksUpdater.js`.
#
# See https://jira.nyu.edu/jira/browse/NYUP-298

# There used to be manual steps here for readium-cfi-js, but now, nothing needs
# to be done.

# End `yarn run prepare:yarn:all` manual steps

cd $READIUM_JS_VIEWER

npm run dist

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: readium-js-viewer `npm run dist` failed.'
    exit 1
fi

cd $CLOUD_READER
ln -s ../epub_content .

cp -p $DIST/cloud-reader_sourcemap/readium-js-viewer_all.js.map $CLOUD_READER/scripts/
