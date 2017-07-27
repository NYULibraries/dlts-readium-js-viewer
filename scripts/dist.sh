#!/usr/bin/env bash

set -x

# `yarn` must be available.
# Decided against including it in this repo as NPM module dependency because
# `npm install yarn` outputs a recommendation to install `yarn` natively instead.
which yarn
if [ $? -ne 0 ]
then
    echo >&2 'ERROR: you must have `yarn` installed: https://yarnpkg.com/en/docs/install.'
    exit 1
fi

READIUM_JS_VIEWER_VERSION=$1

ROOT=$(cd "$(dirname "$0")" ; cd ..; pwd -P )

LOCKFILES_DIR=${ROOT}/lockfiles/${READIUM_JS_VIEWER_VERSION}
if [ ! -d $LOCKFILES_DIR ]
then
    echo >&2 "ERROR: ${LOCKFILES_DIR} does not exist.  Please specify a valid version to build."
    exit 1
fi

TMP=${ROOT}/tmp

READIUM_JS_VIEWER=${ROOT}/readium-js-viewer

READIUM_JS_VIEWER_COMMIT=6dcded9b785ae17dd540e64fedda0809ec2288ac
READIUM_JS_COMMIT=cceed006f346a922d9648fa446608588fed87b28
READIUM_SHARED_JS_COMMIT=94f123256f1fc6c3980081d413d3ec31503f476c
READIUM_CFI_JS_COMMIT=e981832a1a8ba20a5a03a6efbcefa61b429f3c7b

DLTS_PLUGIN_DIR=${READIUM_JS_VIEWER}/readium-js/readium-shared-js/plugins/dltsRjsPluginOaBooks
DLTS_PLUGIN_GITHUB_REPO='git@github.com:NYULibraries/dlts-rjs-plugin-oa-books.git'
DLTS_PLUGIN_GITHUB_COMMIT=fdd5a9f48adb8a333151c729b1eb173c302beb9d

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
