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

ROOT=$(pwd)

LOCKFILES_DIR=${ROOT}/lockfiles/${READIUM_JS_VIEWER_VERSION}
if [ ! -d $LOCKFILES_DIR ]
then
    echo >&2 "ERROR: ${LOCKFILES_DIR} does not exist.  Please specify a valid version to build."
    exit 1
fi

TMP=${ROOT}/tmp

READIUM_JS_VIEWER=${ROOT}/readium-js-viewer

READIUM_JS_VIEWER_COMMIT=b5aa6267dd96601f98a398e3d4e1ef2674d0bcc9
READIUM_JS_COMMIT=1db51c5c5852df2250df8091a6931c008741153a
READIUM_SHARED_JS_COMMIT=87d29fa98519ab70b3376bac979845f154387964
READIUM_CFI_JS_COMMIT=74c9eb365460fd28a884a639a4a039d09a931f70

DLTS_PLUGIN_DIR=${READIUM_JS_VIEWER}/readium-js/readium-shared-js/plugins/dltsRjsPluginOaBooks
DLTS_PLUGIN_GITHUB_REPO='git@github.com:NYULibraries/dlts-rjs-plugin-oa-books.git'
DLTS_PLUGIN_GITHUB_COMMIT=81ad1cb70bdb6926a7138e89de0acb83f5204cda

DIST=$READIUM_JS_VIEWER/dist
CLOUD_READER=$DIST/cloud-reader

# Clone into build space, then rename to clone.  The .git directories seem to have some hardcoded path
# references in them -- they need to be in sync with the final build path.
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
cp -p ${LOCKFILES_DIR}/yarn.lock .
yarn

# Set up submodules.  Note that branches for sub-modules need to be detached HEADs
# to get exact match with expected cloud-reader version info.
cd readium-js/
git checkout $READIUM_JS_COMMIT
# https://github.com/readium/readium-js/issues/165
sed -i.bak "s/zipjs/zip-js/g" package.json
cp -p ${LOCKFILES_DIR}/readium-js/yarn.lock .
yarn

cd readium-shared-js/
git checkout $READIUM_SHARED_JS_COMMIT
cp -p ${LOCKFILES_DIR}/readium-js/readium-shared-js/yarn.lock .
yarn

cd readium-cfi-js/
git checkout $READIUM_CFI_JS_COMMIT
cp -p ${LOCKFILES_DIR}/readium-js/readium-shared-js/readium-cfi-js/yarn.lock .
yarn

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

cd $READIUM_JS_VIEWER
npm run prepare
npm run dist

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: readium-js-viewer `npm run dist` failed.'
    exit 1
fi

cd $CLOUD_READER
ln -s ../epub_content .

cp -p $DIST/cloud-reader_sourcemap/readium-js-viewer_all.js.map $CLOUD_READER/scripts/
