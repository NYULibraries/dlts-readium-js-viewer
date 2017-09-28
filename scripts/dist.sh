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

DLTS_PLUGIN_DIR=${READIUM_JS_VIEWER}/readium-js/readium-shared-js/plugins/dltsRjsPluginOaBooks
DLTS_PLUGIN_GITHUB_REPO='git@github.com:NYULibraries/dlts-rjs-plugin-oa-books.git'

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
git checkout master && git submodule foreach --recursive "git checkout master"

# Set up main repo
# Have to do a checkout before hard reset, because $READIUM_JS_VIEWER_COMMIT might
# be a branch name, which is not automatically checked out.  Apparently doing a
# checkout of a specific commit ID is fine even if the commit is not in a local
# branch.
git checkout $READIUM_JS_VIEWER_COMMIT
git reset --hard $READIUM_JS_VIEWER_COMMIT

# Set up submodules.  Note that branches for sub-modules need to be detached HEADs
# to get exact match with expected cloud-reader version info.
cd readium-js/
git checkout $READIUM_JS_COMMIT

cd readium-shared-js/
git checkout $READIUM_SHARED_JS_COMMIT

cd readium-cfi-js/
git checkout $READIUM_CFI_JS_COMMIT

# Clone DLTS plugin
git clone $DLTS_PLUGIN_GITHUB_REPO $DLTS_PLUGIN_DIR

# Early exit if clone failed.
if [ ! -d $DLTS_PLUGIN_DIR/.git ]
then
    echo >&2 "ERROR: clone of $DLTS_PLUGIN_GITHUB_REPO failed."
    exit 1
fi

cd $DLTS_PLUGIN_DIR
git checkout $DLTS_PLUGIN_GITHUB_COMMIT

# Create plugins-override.cson
cat << EOF > $READIUM_JS_VIEWER/readium-js/readium-shared-js/plugins/plugins-override.cson
plugins:
  include: [
    'dltsRjsPluginOaBooks'
    ${EXTRA_PLUGINS}
  ]
  exclude: [
  ]
EOF

cd $READIUM_JS_VIEWER

yarn run prepare:yarn:all

npm run dist

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: readium-js-viewer `npm run dist` failed.'
    exit 1
fi

cd $CLOUD_READER
ln -s ../epub_content .

cp -p $DIST/cloud-reader_sourcemap/readium-js-viewer_all.js.map $CLOUD_READER/scripts/
