#!/bin/bash

ROOT=$(cd "$(dirname "$0")" ; cd ..; pwd -P )

TMP=$ROOT/tmp

JS_BEAUTIFY="node $ROOT/bin/js-beautify.js"
JSON_BEAUTIFY="node $ROOT/bin/json-beautify.js"

CLOUD_READER_EXPECTED=$ROOT/tests/dist/expected/cloud-reader
CLOUD_READER_GOT=$ROOT/readium-js-viewer/dist/cloud-reader

READIUM_FILE_EXPECTED=$CLOUD_READER_EXPECTED/scripts/readium-js-viewer_all.js
READIUM_FILE_GOT=$CLOUD_READER_GOT/scripts/readium-js-viewer_all.js

READIUM_SOURCE_MAP_EXPECTED=$READIUM_FILE_EXPECTED.map
READIUM_SOURCE_MAP_GOT=$READIUM_FILE_GOT.map

function clean() {
    rm -fr $TMP/*
}

function diff_readium_file() {
    local source_readium_file_expected=$1
    local source_readium_file_got=$2
    local format_command="$3"
    local version_string="$4"
    local sed_command_replace_timestamp="$5"

    local file_basename=$( basename $source_readium_file_expected )

    # Create prettified temporary versions of expected and got files with timestamps replaced.
    tmp_readium_file_expected=$TMP/expected_${file_basename}
    tmp_readium_file_got=$TMP/got_${file_basename}

    $format_command $source_readium_file_expected | \
        sed -E $sed_command_replace_timestamp > $tmp_readium_file_expected
    $format_command $source_readium_file_got  | \
        sed -E $sed_command_replace_timestamp > $tmp_readium_file_got

    # Create separate expected and got files containing only the version info.
    tmp_version_info_file_expected=$TMP/expected-version-info_${file_basename}
    tmp_version_info_file_got=$TMP/got-version-info_${file_basename}

    grep "$version_string" $tmp_readium_file_expected | \
        sed $'s/,/\\\n/g' > $tmp_version_info_file_expected
    grep "$version_string" $tmp_readium_file_got | \
        sed $'s/,/\\\n/g' > $tmp_version_info_file_got

    # Remove version info from the Readium file.
    grep -v "$version_string" $tmp_readium_file_expected > ${tmp_readium_file_expected}.tmp
    mv ${tmp_readium_file_expected}.tmp $tmp_readium_file_expected

    grep -v "$version_string" $tmp_readium_file_got > ${tmp_readium_file_got}.tmp
    mv ${tmp_readium_file_got}.tmp $tmp_readium_file_got

    # Verify the Readium file (not including version info).
    diff_readium_file_minus_version_info="$( diff $tmp_readium_file_expected $tmp_readium_file_got )"
    if [ ! -z "$diff_readium_file_minus_version_info" ]
    then
        echo >&2 "FAIL: ${file_basename} differences detected:"
        diff $tmp_readium_file_expected $tmp_readium_file_got

        exit 1
    fi

    # Diff of full version object.
    REMOVE_LINE_NUMBERS_SED_COMMAND='s/^[0-9][0-9]*c[0-9][0-9]*$//'

    version_info_full_diff=$( \
        diff $tmp_version_info_file_expected $tmp_version_info_file_got | \
        sed $REMOVE_LINE_NUMBERS_SED_COMMAND \
    )

    if [ ! -z "$version_info_full_diff" ]
    then
        echo >&2 "FAIL: ${file_basename} version differences detected:"
        diff $tmp_version_info_file_expected $tmp_version_info_file_got | \
            sed $REMOVE_LINE_NUMBERS_SED_COMMAND

        exit 1
    fi
}

function verify_readium_js_file() {
    local grep_pattern_version_info="return '{\"readiumJsViewer\":"
    local sed_command_replace_timestamp='s/"timestamp":[0-9]{13}/"timestamp":0000000000000/g'
    diff_readium_file                    \
        $READIUM_FILE_EXPECTED           \
        $READIUM_FILE_GOT                \
        "$JS_BEAUTIFY"                   \
        "$grep_pattern_version_info"     \
        "$sed_command_replace_timestamp"
    }

function verify_readium_js_source_map_file() {
    local grep_pattern_version_info="define('text\!version.json'"
    local sed_command_replace_timestamp='s/\\"timestamp\\":[0-9]{13}/"timestamp":0000000000000/g'
    diff_readium_file                    \
        $READIUM_SOURCE_MAP_EXPECTED     \
        $READIUM_SOURCE_MAP_GOT          \
        "$JSON_BEAUTIFY"                 \
        "$grep_pattern_version_info"     \
        "$sed_command_replace_timestamp"
    }

function verify_epub_content_symlink() {
    expected_epub_content_link=$( readlink $CLOUD_READER_EXPECTED/epub_content )
    got_epub_content_link=$( readlink $CLOUD_READER_EXPECTED/epub_content )

    if [ "$expected_epub_content_link" != "$got_epub_content_link" ]
    then
        echo >&2 "FAIL: epub_content symlinks do not match."
        echo >&2 "    Expected: ${expected_epub_content_link}"
        echo >&2 "    Got: ${got_epub_content_link}"

        exit 1
    fi
}

function verify_cloud_reader_remainder() {
    diff_cloud_reader_remainder=$( \
        diff -r                               \
             -x readium-js-viewer_all.js      \
	         -x readium-js-viewer_all.js.map  \
             -x epub_content                  \
                 $CLOUD_READER_EXPECTED $CLOUD_READER_GOT
    )

    if [ ! -z "$diff_cloud_reader_remainder" ]
    then
        echo >&2 "FAIL: cloud-reader differences detected:"

        exit 1
    fi
}

clean

verify_readium_js_file

verify_readium_js_source_map_file

verify_epub_content_symlink

verify_cloud_reader_remainder

echo "OK: $CLOUD_READER_GOT verified."




