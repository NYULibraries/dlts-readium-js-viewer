#!/usr/bin/env bash

ROOT=$(cd "$(dirname "$0")" ; cd ..; pwd -P )
CLOUD_READER_DIST=$ROOT/readium-js-viewer/dist/cloud-reader

source $ROOT/scripts/$(basename $0 .sh)_common.sh

function usage() {
    script_name=$(basename $0)

    cat <<EOF

usage: ${script_name} [-h] [-u username] environment
    -h:          print this usage message
    -u username: username on bastion host and web server
    environment: "dev", "stage", or "prod"

EOF
}

function check_prerequisites() {
    if [ -z "${BASH_VERSINFO}" ] || [ -z "${BASH_VERSINFO[0]}" ] || [ ${BASH_VERSINFO[0]} -lt $MINIMUM_BASH_VERSION ]
    then
        echo >&2 "Bash version must be >= $MINIMUM_BASH_VERSION"
        exit 1
    fi

    if [ ! -x "$(command -v rsync)" ]
    then
        echo >&2 '`rsync` must be available in $PATH in order to run this script.'
        exit 1
    fi
}

function copy_files() {
    local username=$1
    local bastion_host=$2
    local server=$3
    local reader_path=$4

    rsync --archive --compress --delete --human-readable --verbose \
                -e "ssh -o ProxyCommand='ssh -W %h:%p ${username}@${bastion_host}'" \
                $CLOUD_READER_DIST/ \
                ${username}@${server}:${reader_path}/
}

check_prerequisites

READER_PATH=/www/sites/open-square-reader/cloud-reader

while getopts hu: opt
do
    case $opt in
        h) usage; exit 0 ;;
        u) username=$OPTARG ;;
        *) echo >&2 "Options not set correctly."; usage; exit 1 ;;
    esac
done

if [ -z $username ]; then
    echo >&2 'You must provide a username.'
    usage
    exit 1
fi

shift $((OPTIND-1))

deploy_to_environment=$1

validate_environment_arg $deploy_to_environment

server=$( get_server $deploy_to_environment )

copy_files $username $BASTION_HOST $server $READER_PATH

# This string tells the expect script wrapper that refresh run has completed.
echo $SCRIPT_RUN_COMPLETE
