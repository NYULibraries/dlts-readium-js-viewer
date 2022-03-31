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

LOCKFILES_DIR=${ROOT}/lockfiles/${READIUM_JS_VIEWER_VERSION}
if [ ! -d $LOCKFILES_DIR ]
then
    echo >&2 "ERROR: ${LOCKFILES_DIR} does not exist.  Please specify a valid version to build."
    exit 1
fi

READIUM_JS_VIEWER=${ROOT}/readium-js-viewer

TMP=${ROOT}/tmp

DLTS_PLUGIN_DIR=${READIUM_JS_VIEWER}/readium-js/readium-shared-js/plugins/dltsRjsPluginOpenSquare
DLTS_PLUGIN_GITHUB_REPO='git@github.com:NYULibraries/dlts-rjs-plugin-open-square.git'

DIST=$READIUM_JS_VIEWER/dist
CLOUD_READER=$DIST/cloud-reader

# Clean
rm -fr $READIUM_JS_VIEWER

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

cp -p ${LOCKFILES_DIR}/yarn.lock .
yarn install --frozen-lockfile

# Set up submodules.  Note that branches for sub-modules need to be detached HEADs
# to get exact match with expected cloud-reader version info.
cd readium-js/
git checkout $READIUM_JS_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git checkout ${READIUM_JS_COMMIT}\` failed."
    exit 1
fi

cp -p ${LOCKFILES_DIR}/readium-js/yarn.lock .
yarn install --frozen-lockfile

cd readium-shared-js/
git checkout $READIUM_SHARED_JS_COMMIT

if [ $? -ne 0 ]
then
    echo >&2 "ERROR: \`git checkout ${READIUM_SHARED_JS_COMMIT}\` failed."
    exit 1
fi

cp -p ${LOCKFILES_DIR}/readium-js/readium-shared-js/yarn.lock .
yarn install --frozen-lockfile

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

cd $READIUM_JS_VIEWER

yarn run prepare:yarn:all

yarn run dist

cd $CLOUD_READER

cp -p $DIST/cloud-reader_sourcemap/readium-js-viewer_all.js.map $CLOUD_READER/scripts/
