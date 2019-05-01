#!/usr/bin/env bash

ROOT=$(cd "$(dirname "$0")" ; cd ..; pwd -P )

DEPLOY_SCRIPT=${ROOT}/scripts/$(basename $0 _expect.sh).sh

source $ROOT/scripts/$(basename $DEPLOY_SCRIPT .sh)_common.sh

if [ ! -x "$(command -v expect)" ]
then
    cat >&2 <<EOF

Expect does not appear to be installed.  You will need to install it or put the
executable in your PATH in order to run this script.

Expect: http://expect.sourceforge.net/

Alternatively, you can run the refresh script without expect support:

    $DEPLOY_SCRIPT -u username environment
EOF

    exit 1
fi

function usage() {
    script_name=$(basename $0)

    cat <<EOF

usage: ${script_name} environment
    environment: "dev", "stage", or "prod"

EOF
}

while getopts h opt
do
    case $opt in
        h) usage; exit 0 ;;
        *) echo >&2 "Options not set correctly."; usage; exit 1 ;;
    esac
done

shift $((OPTIND-1))

deploy_to_environment=$1

if [ -z "$deploy_to_environment" ]
then
    usage

    exit 0
fi

validate_environment_arg $deploy_to_environment

server=$( get_server $deploy_to_environment )

echo -n "Username for ${BASTION_HOST} and ${server}: "
read username

echo -n "Password for ${BASTION_HOST} and ${server}: "
read -s password

echo

# Originally had heredoc:
# expect<<EOF
# ...but when added `interact` command it didn't work right.  Nothing was being
# echoed from the spawned process, and everything just seemed to hang.
expect -c "
set timeout -1

spawn ${DEPLOY_SCRIPT} -u ${username} ${deploy_to_environment}

set num_rsyncs_to_perform \"1\"

for {set i 1} {\$i <= \$num_rsyncs_to_perform} {incr i 1} {
    expect \"${username}@${BASTION_HOST}'s password:\"

    send \"$password\r\";

    expect -re \"${username}@.*'s password:\"

    send \"$password\r\";

    expect {
        -re \"total size is .*  speedup is \" { puts \"\nrsync #\$i completed successfully.\" }

        \"Permission denied, please try again.\" {
             puts \"\nYou will need to run this script again and re-type your password.\"
             exit 1
        }
    }
}

expect \"${SCRIPT_RUN_COMPLETE}\"
"
