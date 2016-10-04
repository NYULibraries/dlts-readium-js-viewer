#!/usr/bin/env bash

set -x

ROOT=$(pwd)
SNAPSHOT_DIR=${ROOT}/snapshots
TMP=${ROOT}/tmp

READIUM_JS_VIEWER=${ROOT}/readium-js-viewer
READIUM_JS_VIEWER_CLONE=${TMP}/readium-js-viewer_clone

READIUM_JS_VIEWER_COMMIT=0375c9ad36ebc07b6ea074e78fbbe4bbf714b803
READIUM_JS_COMMIT=9c341d64a9c14f81952c6caf015453bbef65d303
READIUM_SHARED_JS_COMMIT=5a56697b77d63962bcbd5733e5a78f1235094c1e
READIUM_CFI_JS_COMMIT=ddc49ae11c7d19d78f1defb03f750d25c3405e1a

READIUM_JS_YOUTUBE_FIX_COMMIT=317b926959a664759994831b6e20358a48109792

READIUM_JS_VIEWER_SNAPSHOT=${READIUM_JS_VIEWER_COMMIT}-with-patch

DLTS_PLUGIN_DIR=${READIUM_JS_VIEWER}/readium-js/readium-shared-js/plugins/dltsRjsPluginOaBooks
DLTS_PLUGIN_GITHUB_REPO='git@github.com:NYULibraries/dlts-rjs-plugin-oa-books.git'
DLTS_PLUGIN_GITHUB_COMMIT=20543bf59f5fdf81df35f01ca5085284cf3ec705

DIST=$READIUM_JS_VIEWER/dist
CLOUD_READER=$DIST/cloud-reader

# Clone into build space, then rename to clone.  The .git directories seem to have some hardcoded path
# references in them -- they need to be in sync with the final build path.
git clone --recursive -b master https://github.com/readium/readium-js-viewer.git $READIUM_JS_VIEWER

# Early exit if clone failed, otherwise the .git for this project will get messed up
# by subsequent git operations.
if [ ! -d $READIUM_JS_VIEWER/.git ]
then
    echo >&2 'ERROR: clone of https://github.com/readium/readium-js-viewer.git failed.'
    exit 1
fi

cd $READIUM_JS_VIEWER
git submodule update --init --recursive
git checkout master && git submodule foreach --recursive "git checkout master"

git reset --hard $READIUM_JS_VIEWER_COMMIT

cd readium-js/
git reset --hard $READIUM_JS_COMMIT
git checkout -b nyup-101_incorporate-readium-fix-for-iframing-youtube-videos-into-oa-books
git cherry-pick $READIUM_JS_YOUTUBE_FIX_COMMIT

cd readium-shared-js/
git reset --hard $READIUM_SHARED_JS_COMMIT

cd readium-cfi-js
git reset --hard $READIUM_CFI_JS_COMMIT

# Rename
cd $ROOT
mv $READIUM_JS_VIEWER $READIUM_JS_VIEWER_CLONE

# Get the snapshot.
cp -p ${SNAPSHOT_DIR}/${READIUM_JS_VIEWER_SNAPSHOT}.tar.bz2 .

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: copy of snapshot failed.'
    exit 1
fi

bunzip2 $READIUM_JS_VIEWER_SNAPSHOT.tar.bz2

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: expanding of the snapshot failed.'
    exit 1
fi

tar -xf $READIUM_JS_VIEWER_SNAPSHOT.tar 1>/dev/null
rm -fr $READIUM_JS_VIEWER_SNAPSHOT.tar 1>/dev/null
mv readium-js-viewer $READIUM_JS_VIEWER

cd $READIUM_JS_VIEWER
# Exit if not in the directory, otherwise this project will get messed up by
# subsequent git operations.
if [ $? -ne  ] || [ $(pwd) != "${READIUM_JS_VIEWER}" ]
then
    echo >&2 "ERROR: could not cd to $READIUM_JS_VIEWER."
    exit 1
fi

# Copy in the .git directories from clone.
cp -pR ${READIUM_JS_VIEWER_CLONE}/.git .
cp -pR ${READIUM_JS_VIEWER_CLONE}/readium-js/.git readium-js/
cp -pR ${READIUM_JS_VIEWER_CLONE}/readium-js/readium-shared-js/.git readium-js/readium-shared-js/
cp -pR ${READIUM_JS_VIEWER_CLONE}/readium-js/readium-shared-js/readium-cfi-js/.git readium-js/readium-shared-js/readium-cfi-js/

# Clone DLTS plugin
git clone $DLTS_PLUGIN_GITHUB_REPO $DLTS_PLUGIN_DIR
git checkout $DLTS_PLUGIN_GITHUB_COMMIT

# Early exit if clone failed.
if [ ! -d $DLTS_PLUGIN_DIR/.git ]
then
    echo >&2 "ERROR: clone of $DLTS_PLUGIN_GITHUB_REPO failed."
    exit 1
fi

cd $READIUM_JS_VIEWER

# TODO: see if https://github.com/readium/readium-cfi-js/commit/bb13853a2f359d446d8ffb571ea90bc22087e6ae
# makes this no longer necessary.
echo 'gitdir: ../.git/modules/readium-js' > readium-js/.git
echo 'gitdir: ../../.git/modules/readium-js/modules/readium-shared-js' > readium-js/readium-shared-js/.git
echo 'gitdir: ../../../.git/modules/readium-js/modules/readium-shared-js/modules/readium-cfi-js' > readium-js/readium-shared-js/readium-cfi-js/.git

npm run dist

if [ $? -ne 0 ]
then
    echo >&2 'ERROR: readium-js-viewer `npm run dist` failed.'
    exit 1
fi

cd $CLOUD_READER
ln -s ../epub_content .

cp -p $DIST/cloud-reader_sourcemap/readium-js-viewer_all.js.map $CLOUD_READER/scripts/
