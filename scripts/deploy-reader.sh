#!/usr/bin/env bash

ROOT=$(cd "$(dirname "$0")" ; cd ..; pwd -P )
CLOUD_READER_DIST=$ROOT/readium-js-viewer/dist/cloud-reader

MINIMUM_BASH_VERSION=4

declare -A ENVIRONMENT

CLOUDFRONT_DISTRIBUTION_ID_KEY_SUFFIX='-cloudfront-distribution-id'
S3_BUCKET_KEY_SUFFIX='-s3-bucket'

ENVIRONMENT[dev${CLOUDFRONT_DISTRIBUTION_ID_KEY_SUFFIX}]=EL7QDX6Z1W41V
ENVIRONMENT[dev${S3_BUCKET_KEY_SUFFIX}]=dlts-open-square-reader-dev

ENVIRONMENT[stage${CLOUDFRONT_DISTRIBUTION_ID_KEY_SUFFIX}]=E1KNZQHSUHQPYG
ENVIRONMENT[stage${S3_BUCKET_KEY_SUFFIX}]=dlts-open-square-reader-stage

ENVIRONMENT[prod${CLOUDFRONT_DISTRIBUTION_ID_KEY_SUFFIX}]=EA76G2VXY1H42
ENVIRONMENT[prod${S3_BUCKET_KEY_SUFFIX}]=dlts-open-square-reader

function usage() {
    script_name=$(basename $0)

    cat <<EOF

usage: ${script_name} [-h] [-u username] environment
    -h:          print this usage message
    environment: "dev", "stage", or "prod"

EOF
}

function check_prerequisites() {
    if [ -z "${BASH_VERSINFO}" ] || [ -z "${BASH_VERSINFO[0]}" ] || [ ${BASH_VERSINFO[0]} -lt $MINIMUM_BASH_VERSION ]
    then
        echo >&2 "Bash version must be >= $MINIMUM_BASH_VERSION"
        exit 1
    fi

    if [ ! -x "$(command -v aws)" ]
    then
        echo >&2 '`aws` must be available in $PATH in order to run this script.'
        exit 1
    fi
}

function get_cloudfront_distribution_id() {
    local deploy_to_environment=$1

    echo ${ENVIRONMENT[${deploy_to_environment}${CLOUDFRONT_DISTRIBUTION_ID_KEY_SUFFIX}]}
}

function get_s3_bucket() {
    local deploy_to_environment=$1

    echo ${ENVIRONMENT[${deploy_to_environment}${S3_BUCKET_KEY_SUFFIX}]}
}

function sync_s3_bucket() {
    local s3_bucket=$1

    # Need to do a full rm followed by a sync from scratch because `aws s3 sync ... --exact-timestamps`
    # only works for downloads from S3, not uploads: https://github.com/aws/aws-cli/issues/4460
    aws s3 rm s3://${s3_bucket}/open-square-reader/cloud-reader --recursive
    aws s3 sync $CLOUD_READER_DIST s3://${s3_bucket}/open-square-reader/cloud-reader/
}

function validate_environment_arg() {
    local deploy_to_environment=$1

    if ! [ ${ENVIRONMENT[${deploy_to_environment}${S3_BUCKET_KEY_SUFFIX}]} ]
    then
        echo >&2 "\"${deploy_to_environment}\" is not a recognized deployment environment."

        usage

        exit 1
    fi
}

check_prerequisites

while getopts h: opt
do
    case $opt in
        h) usage; exit 0 ;;
        *) echo >&2 "Options not set correctly."; usage; exit 1 ;;
    esac
done

shift $((OPTIND-1))

deploy_to_environment=$1

validate_environment_arg $deploy_to_environment

s3_bucket=$( get_s3_bucket $deploy_to_environment )
sync_s3_bucket $s3_bucket

cloudfront_distribution_id=$( get_cloudfront_distribution_id $deploy_to_environment )
aws cloudfront create-invalidation \
        --distribution-id ${cloudfront_distribution_id} \
        --paths '/open-square-reader/*'
